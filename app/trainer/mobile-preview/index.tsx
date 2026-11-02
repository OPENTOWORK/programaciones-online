import { useState } from 'react';

import { AthleteMobilePreview } from '@/components/trainer/AthleteMobilePreview';
import { TrainerMobilePreviewPage } from '@/components/trainer/TrainerMobilePreviewPage';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';

export default function TrainerMobilePreviewScreen() {
  const [audience, setAudience] = useState<'athlete' | 'trainer'>('athlete');

  return (
    <ScreenWrapper scrollable={false} padded={false}>
      {audience === 'athlete' ? (
        <AthleteMobilePreview onOpenTrainer={() => setAudience('trainer')} />
      ) : (
        <TrainerMobilePreviewPage onOpenAthlete={() => setAudience('athlete')} />
      )}
    </ScreenWrapper>
  );
}
