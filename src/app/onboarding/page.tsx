import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Mascot } from '@/components/ui/Mascot';
import { Title, Text, Note } from '@/components/ui/Text';
import { Item } from '@/components/ui/Item';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  return (
    <>
      <Header title="" showLogo />
      <Screen>
        <Mascot />
        <Title>Bring in what you already know about your students.</Title>
        <Text>Connect the tools you already use. We&apos;ll organize lesson schedules, notes, and important student context for you.</Text>
        <div>
          <Item title="Connect what you use" />
          <Item title="Review what we find" />
          <Item title="Start with organized student memories" />
        </div>
        <Note>Nothing is added to a student memory until you review it.</Note>
        <Button href="/onboarding/connect">Get started</Button>
        <Button variant="ghost" disabled>
          Start manually
        </Button>
      </Screen>
    </>
  );
}
