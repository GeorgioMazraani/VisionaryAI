import { create } from 'zustand';

interface SocketState {
  socketReady: boolean;
  setSocketReady: (ready: boolean) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socketReady: false,
  setSocketReady: (ready: boolean) => set({ socketReady: ready }),
}));
