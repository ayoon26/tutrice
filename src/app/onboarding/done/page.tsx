import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { Mascot } from '@/components/ui/Mascot';
import { Title, Text, Note } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export default function OnboardingCompletePage() {
  return (
    <>
      <Header title="Onboarding Complete" showBack />
      <Screen>
        <Mascot />
        <Title>Your memory is ready.</Title>
        <Text>We&apos;ll bring forward the most useful context before lessons and update memory as you teach.</Text>
        <Note>You can change or remove any memory later.</Note>
        <Button href="/today">Go to Today</Button>
        <Button variant="ghost" disabled>
          Review another student
        </Button>
      </Screen>
    </>
  );
}
