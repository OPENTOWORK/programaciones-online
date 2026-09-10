import type { GymMember } from '@/lib/gymTypes';

export type GymMemberSignupSource = 'manual' | 'wellhub' | 'import';

export const GYM_MEMBER_SIGNUP_SOURCE_LABELS: Record<GymMemberSignupSource, string> = {
  manual: 'Manual',
  wellhub: 'Wellhub',
  import: 'Importación',
};

export function isWellhubPlanName(planName?: string | null) {
  if (!planName) return false;
  return planName.trim().toLowerCase().includes('wellhub');
}

export function isWellhubMember(
  member: Pick<GymMember, 'id' | 'signupSource'>,
  planMemberIds?: ReadonlySet<string>,
) {
  if (member.signupSource === 'wellhub') return true;
  return planMemberIds?.has(member.id) ?? false;
}
