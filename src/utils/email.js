import API from '../BackendAPi/ApiProvider';

// Same pattern as backend/utils/email.js.
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const INVALID_EMAIL_MESSAGE = 'Enter a valid email address';

// Local syntax check only; verifyEmail() adds the server checks.
export function getEmailValidationError(raw, { required = true } = {}) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    return required ? 'Email is required' : null;
  }
  if (trimmed.length > 254 || !EMAIL_REGEX.test(trimmed)) {
    return INVALID_EMAIL_MESSAGE;
  }
  const [local] = trimmed.split('@');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return INVALID_EMAIL_MESSAGE;
  }
  return null;
}

// Full check: syntax here, then the server confirms the domain exists, has
// mail servers (DNS/MX), the mail server accepts connections and the mailbox
// exists (SMTP probe), and that it isn't fake/disposable/a typo like gmial.com.
// Returns an error message, or null when the address is fine or the server
// check couldn't run (offline, rate limited) - the save route validates again.
export async function verifyEmail(raw, { required = true } = {}) {
  const localError = getEmailValidationError(raw, { required });
  if (localError || !String(raw ?? '').trim()) return localError;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  try {
    const { data } = await API.post('/api/validate/email', { email: String(raw).trim() }, { timeout: 10000 });
    return data?.valid === false ? data.message || INVALID_EMAIL_MESSAGE : null;
  } catch (err) {
    return null;
  }
}
