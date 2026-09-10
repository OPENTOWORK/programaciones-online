/** Normaliza un teléfono para enlaces wa.me (solo dígitos, con prefijo país si falta). */
export function normalizePhoneForWhatsApp(phone?: string) {
  const digits = phone?.replace(/\D/g, '') ?? '';
  if (!digits) return null;
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.length === 9 && /^[67]/.test(digits)) return `34${digits}`;
  return digits;
}

export function getWhatsAppUrl(phone?: string) {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}`;
}
