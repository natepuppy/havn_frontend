const DEFAULT_API_URL = "http://localhost:3000/";
const DEFAULT_AUTH_API_URL = "http://localhost:3000";

export const apiBaseUrl = import.meta.env.VITE_PEST_API_URL || DEFAULT_API_URL;
export const authApiBaseUrl =
  import.meta.env.VITE_AUTH_API_URL || DEFAULT_AUTH_API_URL;
