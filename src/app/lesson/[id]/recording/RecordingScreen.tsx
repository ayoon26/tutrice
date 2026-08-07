'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { Title, Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RecordingScreen({ lessonId, studentName, todayFocus }: { lessonId: string; studentName: string; todayFocus: string | null }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.start(1000);
        recorderRef.current = recorder;
      })
      .catch(() => setMicError('Microphone access was denied — the lesson will continue without audio.'));

    const timer = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function endLesson() {
    setEnding(true);
    const recorder = recorderRef.current;

    const audioBlob = await new Promise<Blob | null>((resolve) => {
      if (!recorder || recorder.state === 'inactive') return resolve(null);
      recorder.onstop = () => resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      recorder.stop();
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());

    const form = new FormData();
    if (audioBlob && audioBlob.size > 0) form.set('audio', audioBlob, 'lesson.webm');
    await fetch(`/api/lessons/${lessonId}/recording`, { method: 'POST', body: form });

    router.push(`/lesson/${lessonId}/processing`);
  }

  return (
    <Screen>
      <Title>Recording {studentName}&apos;s lesson</Title>
      <Text>{micError ?? `Listening for lesson details · ${formatElapsed(elapsed)}`}</Text>
      {todayFocus && <Card title="Today's focus" lines={[{ label: 'Reminder', value: todayFocus }]} />}
      <Button variant="ghost" disabled onClick={() => {}}>
        View teaching reminders
      </Button>
      <Button onClick={endLesson} loading={ending} loadingLabel="Ending…">
        End lesson
      </Button>
    </Screen>
  );
}
