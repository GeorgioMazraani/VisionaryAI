import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '../store/socketStore';

const SOCKET_URL = 'http://localhost:5000';
let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket) return;

  console.log('🔑 Connecting socket with token:', token);

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    useSocketStore.getState().setSocketReady(true); // ✅ SET Zustand HERE
  });

  socket.on('disconnect', () => {
    console.warn('⚠️ Socket disconnected');
    useSocketStore.getState().setSocketReady(false);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connect error:', err.message);
  });
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error('Socket not initialized');
  return socket;
};
