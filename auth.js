import 'react-native-get-random-values';
import { Amplify } from 'aws-amplify';
import { confirmSignUp, deleteUser, fetchAuthSession, getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth';
import { apiRequest, clearAccessToken, isBackendConfigured, saveAccessToken } from './backend';

const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-2_k8uNPYlsr';
const userPoolClientId = process.env.EXPO_PUBLIC_COGNITO_APP_CLIENT_ID || '6ga7cb5ald72vo753trogruhme';

if (userPoolId && userPoolClientId) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
      },
    },
  });
}

function ensureConfigured() {
  if (!userPoolId || !userPoolClientId) throw new Error('Secure sign-in is not configured in this build yet.');
}

async function persistAccessToken() {
  const { tokens } = await fetchAuthSession();
  const token = tokens?.idToken?.toString() || tokens?.accessToken?.toString();
  if (!token) throw new Error('Your secure session could not be created. Please sign in again.');
  await saveAccessToken(token);
}

export async function createAccount({ email, password }) {
  ensureConfigured();
  const result = await signUp({
    username: email.trim().toLowerCase(),
    password,
    options: { userAttributes: { email: email.trim().toLowerCase() } },
  });
  return { complete: result.isSignUpComplete, nextStep: result.nextStep.signUpStep };
}

export async function confirmAccount({ email, code }) {
  ensureConfigured();
  const result = await confirmSignUp({ username: email.trim().toLowerCase(), confirmationCode: code.trim() });
  return result.isSignUpComplete;
}

export async function signInWithPassword({ email, password }) {
  ensureConfigured();
  const result = await signIn({ username: email.trim().toLowerCase(), password });
  if (!result.isSignedIn) return { complete: false, nextStep: result.nextStep.signInStep };
  await persistAccessToken();
  return { complete: true };
}

export async function restoreSignedInUser() {
  try {
    const user = await getCurrentUser();
    await persistAccessToken();
    return user;
  } catch {
    return null;
  }
}

export async function signOutEverywhere() {
  await signOut({ global: true });
  await clearAccessToken();
}

export async function deleteAccount() {
  if (isBackendConfigured()) {
    try {
      await apiRequest('/v1/me', { method: 'DELETE' });
    } catch {
      try {
        await deleteUser();
      } catch {}
    }
  } else {
    try {
      await deleteUser();
    } catch {}
  }
  await signOutEverywhere().catch(() => {});
}
