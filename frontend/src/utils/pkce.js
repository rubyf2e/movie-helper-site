/**
 * 生成隨機的 code verifier
 * @param {number} length - 長度 (43-128 字符)
 * @returns {string} code verifier
 */
export function generateCodeVerifier(length = 128) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .substring(0, length);
}

/**
 * 生成 code challenge (SHA256 hash of code verifier)
 * @param {string} codeVerifier - code verifier
 * @returns {Promise<string>} code challenge
 */
export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * 生成隨機的 state 參數
 * @returns {string} state
 */
export function generateState() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * 生成隨機的 nonce 參數
 * @returns {string} nonce
 */
export function generateNonce() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
