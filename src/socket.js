import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL;
console.log({ URL });
export const socket = io(URL);