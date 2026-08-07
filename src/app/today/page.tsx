import { redirect } from 'next/navigation';
import { requireTutorId } from '@/lib/auth';
import { db } from '@/lib/data';
import { hasGoogleOAuth } from '@/lib/config';
import { listTodayEvents } from '@/lib/integrations/googleCalendar';
import { relativeDay } from '@/lib/format';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Subtitle, SectionLabel } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function TodayPage() {
  const tutorId = await requireTutorId();
  const students = await db.listStudents(tutorId, 'confirmed');
  if (!students.length) redirect('/onboarding');

  let liveTimes = new Map<string, string>();
  if (hasGoogleOAuth) {
    const token = await db.getCalendarAccessToken(tutorId);
    if (token) {
      const events = await listTodayEvents(token);
      liveTimes = new Map(
        students
          .map((s) => {
            const firstName = s.name.split(' ')[0].toLowerCase();
            const match = events.find((e) => e.title.toLowerCase().includes(firstName));
            return match ? ([s.id, match.time] as const) : null;
          })
          .filter((x): x is [string, string] => x !== null)
      );
    }
  }
  // Without a live calendar connection every confirmed student is treated as
  // a candidate lesson today — a fair default for a fresh, calendar-less setup.
  const todaysStudents = hasGoogleOAuth && liveTimes.size ? students.filter((s) => liveTimes.has(s.id)) : students;

  const cards = await Promise.all(
    todaysStudents.map(async (s) => {
      const memory = await db.listMemory(s.id);
      const recent = [...memory].reverse().slice(0, 3);
      return { student: s, time: liveTimes.get(s.id), recent };
    })
  );

  const allRecent = (
    await Promise.all(students.map(async (s) => (await db.listMemory(s.id)).map((m) => ({ ...m, studentName: s.name }))))
  )
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  return (
    <>
      <Header title="" showLogo />
      <Screen>
        <Title>{greeting()}</Title>
        <Subtitle>
          You have {cards.length} lesson{cards.length === 1 ? '' : 's'} today.
        </Subtitle>
        {cards.map(({ student, time, recent }) => (
          <Card
            key={student.id}
            title={`${student.name}${student.subject ? ` · ${student.subject}` : ''}`}
            meta={time ? `Today at ${time}` : 'Today'}
            plainLines={recent.map((m) => m.label)}
            href={`/today/prepare/${student.id}`}
          />
        ))}
        {cards[0] && <Button href={`/today/prepare/${cards[0].student.id}`}>Prepare for {cards[0].student.name.split(' ')[0]}</Button>}
        {allRecent && (
          <>
            <SectionLabel>Recent update</SectionLabel>
            <Item title={`${allRecent.studentName}'s note was added ${relativeDay(allRecent.createdAt)}.`} />
          </>
        )}
        <Button variant="ghost" href={`/students/${students[0].id}/add`}>
          Add information
        </Button>
      </Screen>
    </>
  );
}
