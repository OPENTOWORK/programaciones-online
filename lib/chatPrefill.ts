let pendingChatPrefill: string | null = null;

export function queueChatPrefill(message: string) {
  pendingChatPrefill = message;
}

export function takeChatPrefill() {
  const message = pendingChatPrefill;
  pendingChatPrefill = null;
  return message;
}
