import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, getSubscription } from "@/services/settings";
import type { UserPreferences, Subscription } from "@/lib/types/settings";

type SettingsData = {
  preferences: UserPreferences;
  subscription: Subscription;
};

async function fetchSettingsData(): Promise<SettingsData> {
  const [preferences, subscription] = await Promise.all([
    getSettings(),
    getSubscription(),
  ]);
  return { preferences, subscription };
}

export function useSettingsData() {
  return useQuery<SettingsData>({
    queryKey: ["settings"],
    queryFn: fetchSettingsData,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      // Stub — real API call when backend exists
      await new Promise((r) => setTimeout(r, 100));
      return updates;
    },
    onSuccess: (updates) => {
      queryClient.setQueryData<SettingsData>(["settings"], (old) => {
        if (!old) return old;
        return {
          ...old,
          preferences: { ...old.preferences, ...updates },
        };
      });
    },
  });
}
