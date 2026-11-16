import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Profile = {
  name: string;
  focusAreas: string[];
};

/** habitId -> highest milestone already celebrated for the run starting `since` */
export type CelebratedMilestones = Record<string, { since: string; days: number }>;

type UserState = {
  hasCompletedOnboarding: boolean;
  celebrated: CelebratedMilestones;
  markCelebrated: (habitId: number, since: string, days: number) => void;
  profile: Profile;
  setProfile: (profile: Partial<Profile>) => void;
  _hasHydrated: boolean;
  completedOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      hasCompletedOnboarding: false,
      profile: { name: "", focusAreas: [] },
      celebrated: {},
      markCelebrated: (habitId, since, days) =>
        set((state) => ({ celebrated: { ...state.celebrated, [habitId]: { since, days } } })),
      _hasHydrated: false,
      setProfile: (profile) =>
        set((state) => ({ profile: { ...state.profile, ...profile } })),
      
      completedOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () =>
        set({ hasCompletedOnboarding: false}),
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) =>
          SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      })),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    }
  )
);