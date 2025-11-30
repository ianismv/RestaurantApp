import axios from 'axios';

export const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api',
  withCredentials: true,
});