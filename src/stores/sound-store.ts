import { create } from "zustand";

interface SoundState {
  initialized: boolean;
  currentMusic: string | null;
  volume: number;
  musicVolume: number;
  setInitialized: (v: boolean) => void;
  setCurrentMusic: (m: string | null) => void;
  setVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  initialized: false,
  currentMusic: null,
  volume: 0.7,
  musicVolume: 0.3,
  setInitialized: (v) => set({ initialized: v }),
  setCurrentMusic: (m) => set({ currentMusic: m }),
  setVolume: (v) => set({ volume: v }),
  setMusicVolume: (v) => set({ musicVolume: v }),
}));
