import apiClient from '../../api/client.js';

const KEY = 'tf_tenant_pkce';
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** The address the API sends the authorize page back to (it then forwards the code to this site). */
export const testflowRedirectUri = () => `${apiClient.defaults.baseURL}/api/auth/testflow/callback`;

/** Start "Log in with Testflow": make a PKCE pair, keep the verifier here, and open Testflow's authorize page. */
export async function startTestflowLogin(hostname) {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const state = btoa(JSON.stringify({ n: b64url(crypto.getRandomValues(new Uint8Array(8))), o: window.location.origin, h: hostname })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  sessionStorage.setItem(KEY, JSON.stringify({ verifier, state }));
  const base = import.meta.env.VITE_TESTFLOW_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://testflow.com.ng');
  const url = new URL('/oauth/authorize', base);
  url.search = new URLSearchParams({
    client_id: 'testflow-everyone', redirect_uri: testflowRedirectUri(), code_challenge: challenge, state, site: hostname,
  }).toString();
  window.location.assign(url.toString());
}

/** Read back the verifier saved by startTestflowLogin, once, and only if the state matches. */
export function takeVerifier(state) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    sessionStorage.removeItem(KEY);
    return saved && saved.state === state ? saved.verifier : null;
  } catch {
    return null;
  }
}
