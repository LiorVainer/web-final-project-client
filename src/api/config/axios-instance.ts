// src/api/axiosInstance.ts
import axios from 'axios';

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;

if (!SERVER_URL) {
    throw new Error('Server URL is not defined');
}

export const axiosInstance = axios.create({
    baseURL: SERVER_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
