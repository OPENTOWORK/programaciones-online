import type { Session, User } from '@supabase/supabase-js';

export type SignUpInterpretation =
  | { type: 'needs_email_confirmation' }
  | { type: 'session_created' }
  | { type: 'already_registered' }
  | { type: 'empty' };

export {
  interpretSignUpResponse,
  mapSignUpErrorMessage,
} from '../scripts/lib/signUpResult.mjs';

export type { SignUpInterpretation as SignUpInterpretationType };
