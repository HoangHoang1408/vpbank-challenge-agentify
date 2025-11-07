import { ToneOption } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingState {
  tone: ToneOption | null;
  emailSignature: string;
}

interface SettingAction {
  setTone: (tone: ToneOption) => void;
  setEmailSignature: (emailSignature: string) => void;
  reset: () => void;
}

interface SettingStore extends SettingState, SettingAction {}

export const useSettingStore = create<SettingStore>()(
  persist(
    (set) => ({
      tone: null,
      emailSignature: '',

      setTone: (tone: ToneOption) => set({ tone }),

      setEmailSignature: (emailSignature: string) => set({ emailSignature }),

      reset: () => set({ tone: null, emailSignature: '' }),
    }),

    {
      name: 'setting-store',
      partialize: (state) => ({
        tone: state.tone,
        emailSignature: state.emailSignature,
      }),
    },
  ),
);
