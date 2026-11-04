import apiClient from '../../api/client.js';

/** Where the Google button sends the browser: the API starts the flow and hands the person back to this site. */
export const googleStartUrl = (hostname) =>
  `${apiClient.defaults.baseURL}/api/auth/google?${new URLSearchParams({ host: hostname, returnTo: window.location.origin })}`;
