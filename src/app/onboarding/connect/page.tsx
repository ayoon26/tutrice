import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Subtitle, Note, SectionLabel } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';

export default function ConnectToolsPage() {
  return (
    <>
      <Header title="Connect Existing Tools" showBack step={[1, 3]} />
      <Screen>
        <Subtitle>Start with your calendar. It helps us identify your students and lesson schedules.</Subtitle>
        <Item title="Google Calendar" subtitle="Recommended" badge="✓" badgeTone="accent" href="/onboarding/connect/google" />
        <Item title="Apple Calendar" badge="Later" badgeTone="neutral" />
        <Item title="Outlook Calendar" badge="Later" badgeTone="neutral" />
        <Note>We&apos;ll look for recurring lesson events, student names, lesson times, and event notes.</Note>
        <SectionLabel>Notes and files</SectionLabel>
        <Item title="Notion" badge="Later" badgeTone="neutral" />
        <Item title="Google Drive" badge="Later" badgeTone="neutral" />
        <Button href="/onboarding/connect/google">Continue with Google Calendar</Button>
      </Screen>
    </>
  );
}
