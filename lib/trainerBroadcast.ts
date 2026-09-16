import { sendTrainerReply } from '@/lib/trainerService';

/** Etiqueta que el entrenador escribe en la plantilla para personalizar cada mensaje. */
export const BROADCAST_NAME_TOKEN = '**Nombre**';

/* Se aceptan varias formas de escribirlo para no depender de los asteriscos exactos. */
const NAME_TOKEN_SOURCE = String.raw`\*\*\s*nombre\s*\*\*|\{\{\s*nombre\s*\}\}|\[\s*nombre\s*\]`;

function nameTokenPattern() {
  return new RegExp(NAME_TOKEN_SOURCE, 'gi');
}

export function athleteFirstName(fullName: string) {
  const trimmed = fullName.trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

export function broadcastTemplateUsesName(template: string) {
  return nameTokenPattern().test(template);
}

export function renderBroadcastMessage(template: string, athleteName: string) {
  return template.replace(nameTokenPattern(), athleteFirstName(athleteName));
}

export interface BroadcastRecipient {
  id: string;
  name: string;
}

export interface BroadcastOutcome {
  sent: number;
  failed: BroadcastRecipient[];
}

interface SendBroadcastOptions {
  /** Modo demo: no hay Supabase, así que se cuenta como enviado sin persistir. */
  simulate?: boolean;
  onProgress?: (done: number, total: number) => void;
}

/* Se envía en tandas pequeñas: en paralelo total una lista larga saturaría Supabase. */
const BATCH_SIZE = 4;

export async function sendTrainerBroadcast(
  recipients: readonly BroadcastRecipient[],
  template: string,
  { simulate = false, onProgress }: SendBroadcastOptions = {},
): Promise<BroadcastOutcome> {
  const failed: BroadcastRecipient[] = [];
  let sent = 0;
  let done = 0;

  for (let index = 0; index < recipients.length; index += BATCH_SIZE) {
    const batch = recipients.slice(index, index + BATCH_SIZE);

    await Promise.all(
      batch.map(async (recipient) => {
        const text = renderBroadcastMessage(template, recipient.name).trim();
        const delivered = text
          ? simulate || Boolean(await sendTrainerReply(recipient.id, text))
          : false;

        if (delivered) sent += 1;
        else failed.push(recipient);

        done += 1;
        onProgress?.(done, recipients.length);
      }),
    );
  }

  return { sent, failed };
}
