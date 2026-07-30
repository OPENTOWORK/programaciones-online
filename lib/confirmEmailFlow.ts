export type ConfirmEmailErrorKind = 'expired' | 'already_used' | 'invalid_link' | 'generic';

export type ConfirmEmailErrorUi = {
  title: string;
  message: string;
  showResend: boolean;
  showLogin: boolean;
};

export {
  classifyConfirmEmailCallbackError,
  getConfirmEmailErrorUi,
  isEmailConfirmationDeepLink,
  resolveConfirmEmailErrorFromCallback,
  resolveConfirmEmailErrorUi,
} from '../scripts/lib/confirmEmailFlow.mjs';
