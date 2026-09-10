import { ActionSheetModal } from '@/components/ui/ActionSheetModal';

export function SessionVideoSendModal({
  visible,
  title = '¿Enviar este vídeo?',
  subtitle,
  exerciseName,
  sending = false,
  onSend,
  onEdit,
  onCancel,
}: {
  visible: boolean;
  title?: string;
  subtitle?: string;
  exerciseName?: string;
  sending?: boolean;
  onSend: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const resolvedSubtitle = subtitle ?? (exerciseName ? `Ejercicio: ${exerciseName}` : undefined);

  return (
    <ActionSheetModal
      visible={visible}
      title={title}
      subtitle={resolvedSubtitle}
      onClose={onCancel}
      actions={[
        {
          key: 'send',
          label: sending ? 'Enviando…' : 'Enviar',
          disabled: sending,
          onPress: onSend,
        },
        {
          key: 'edit',
          label: 'Editar antes de enviar',
          disabled: sending,
          onPress: onEdit,
        },
      ]}
    />
  );
}
