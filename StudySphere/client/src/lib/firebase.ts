// Firebase removed - using simple email authentication instead
export const hasFirebaseConfig = false;
export const auth = null;

export function loginWithGoogle() {
  throw new Error("Firebase authentication removed - use email login instead");
}

export async function handleRedirectResult() {
  return null;
}