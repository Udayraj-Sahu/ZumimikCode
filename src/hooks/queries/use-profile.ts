import { useQuery } from "@tanstack/react-query";
import { getProfile, getProfileStats, getAchievements } from "@/services/profile";
import type { ProfileData, ProfileStat, Achievement } from "@/lib/types/profile";

type ProfileDataResult = {
  profile: ProfileData;
  stats: ProfileStat[];
  achievements: Achievement[];
};

async function fetchProfileData(): Promise<ProfileDataResult> {
  const [profile, stats, achievements] = await Promise.all([
    getProfile(),
    getProfileStats(),
    getAchievements(),
  ]);
  return { profile, stats, achievements };
}

export function useProfileData() {
  return useQuery<ProfileDataResult>({
    queryKey: ["profile"],
    queryFn: fetchProfileData,
  });
}
