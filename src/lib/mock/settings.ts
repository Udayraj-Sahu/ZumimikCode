import type { UserPreferences, Subscription } from "@/lib/types/settings";

export const USER_PREFERENCES: UserPreferences = {
  pushNotifications: true,
  sessionReminders: false,
  restDuration: "60s",
  email: "user@examarena.com",
};

export const SUBSCRIPTION: Subscription = {
  plan: "free",
  price: "$9.99/MO",
};
