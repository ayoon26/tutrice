import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Title, Text, Note, SectionLabel } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';

export default function GoogleCalendarPermissionPage() {
  return (
    <>
      <Header title="Google Calendar Permission" showBack step={[2, 3]} />
      <Screen>
        <Title>Connect Google Calendar</Title>
        <Text>Find your students from your lesson schedule.</Text>
        <SectionLabel>Tutrice will read</SectionLabel>
        <Item title="Event titles and times" />
        <Item title="Recurring lesson patterns" />
        <Item title="Notes attached to events" />
        <SectionLabel>Tutrice will not</SectionLabel>
        <Item title="Send invites or edit your calendar" />
        <Item title="Share your calendar with anyone" />
        <Note>You&apos;ll review every suggested student before anything is added.</Note>
        {/* Real navigation (not client-routed) so the server can 302 to Google's consent screen. */}
        <div style={{ padding: '6px var(--space-4) 2px' }}>
          <a href="/api/calendar/oauth/start" className="btn btn-primary btn-block">
            Allow calendar access
          </a>
        </div>
      </Screen>
    </>
  );
}
