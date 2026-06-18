const isProduction = import.meta.env.PROD;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (isProduction ? '/api' : 'http://10.0.0.10:3002/api');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (isProduction ? window.location.origin : 'http://10.0.0.10:3002');

export const JITSI_DOMAIN =
  import.meta.env.VITE_JITSI_DOMAIN || 'meet.ambilengua.es';

export const JITSI_URL =
  import.meta.env.VITE_JITSI_URL || `https://${JITSI_DOMAIN}`;
