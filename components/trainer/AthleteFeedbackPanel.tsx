import { type ViewStyle } from 'react-native';

import { AthleteFeedbackComposer } from '@/components/trainer/AthleteFeedbackComposer';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import type { useTrainerAthleteFeedback } from '@/hooks/useTrainerAthleteFeedback';
import type { FeedbackAttachmentDraft } from '@/lib/trainerFeedbackMediaService';

type TrainerAthleteFeedbackState = ReturnType<typeof useTrainerAthleteFeedback>;

export function AthleteFeedbackPanel({
  feedback,
  style,
}: {
  feedback: TrainerAthleteFeedbackState;
  style?: ViewStyle;
}) {
  const generalEntries = feedback.entries.filter((entry) => !entry.sessionLogId);

  const handleSend = async (message: string, drafts: FeedbackAttachmentDraft[]) =>
    feedback.send(message, drafts);

  return (
    <CollapsibleSection
      style={style}
      title="Feedback general"
      subtitle="Valoraciones globales del atleta. Aparecerán en Mi Progreso y en el chat principal."
    >
      <AthleteFeedbackComposer
        entries={generalEntries}
        isLoading={feedback.isLoading}
        sending={feedback.sending}
        persistent={feedback.persistent}
        error={feedback.error}
        onSend={handleSend}
        onUpdate={feedback.update}
        onRemove={feedback.remove}
        placeholder="Valoración general, objetivos o recomendaciones..."
        historyTitle="Feedback general enviado"
        emptyHistoryText="Todavía no se ha enviado feedback general a este atleta."
      />
    </CollapsibleSection>
  );
}
