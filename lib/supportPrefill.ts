import type { SupportCategory } from '@/lib/supportService';

export type SupportPrefill = {
  category?: SupportCategory;
  subject?: string;
  message?: string;
};

let pendingSupportPrefill: SupportPrefill | null = null;

export function queueSupportPrefill(input: SupportPrefill) {
  pendingSupportPrefill = input;
}

export function takeSupportPrefill() {
  const value = pendingSupportPrefill;
  pendingSupportPrefill = null;
  return value;
}
