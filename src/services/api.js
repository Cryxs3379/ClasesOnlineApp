import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}
