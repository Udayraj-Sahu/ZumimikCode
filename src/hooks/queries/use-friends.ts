import { useQuery } from "@tanstack/react-query";
import { getFriends, getFriendActivity, getPendingRequests } from "@/services/friends";
import type { Friend, FriendActivity } from "@/lib/types/friends";

type FriendsData = {
  friends: Friend[];
  activity: FriendActivity[];
  requests: Friend[];
};

async function fetchFriendsData(): Promise<FriendsData> {
  const [friends, activity, requests] = await Promise.all([
    getFriends(), getFriendActivity(), getPendingRequests(),
  ]);
  return { friends, activity, requests };
}

export function useFriends() {
  return useQuery<FriendsData>({
    queryKey: ["friends"],
    queryFn: fetchFriendsData,
  });
}
