import apiClient from '../../api/client.js';

/** The API starts the Google flow and signs the person in on the way back. */
export const googleStartUrl = () => `${apiClient.defaults.baseURL}/api/auth/google`;
