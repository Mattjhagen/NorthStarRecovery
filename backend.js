import * as SecureStore from 'expo-secure-store';

// Expo only embeds EXPO_PUBLIC_* values in the app. This file deliberately
// rejects missing configuration and never accepts AWS access keys on-device.
const config = Object.freeze({
  region: process.env.EXPO_PUBLIC_AWS_REGION,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, ''),
  userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
  userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_APP_CLIENT_ID,
});

const ACCESS_TOKEN_KEY = 'northstar.access-token';

export function isBackendConfigured() {
  return Boolean(config.region && config.apiBaseUrl && config.userPoolId && config.userPoolClientId);
}

export function getBackendSetupMessage() {
  return isBackendConfigured() ? null : 'AWS backend is not configured in this build yet.';
}

// Tokens belong in encrypted native storage, never AsyncStorage or source files.
export async function saveAccessToken(token) {
  if (!token) throw new Error('A non-empty access token is required.');
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  if (!isBackendConfigured()) throw new Error(getBackendSetupMessage());
  const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status}).`);
  if (response.status === 204) return null;
  return response.json();
}

export const backendConfig = config;
