import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.examarena.app",
  appName: "Exam Arena",
  webDir: "out",
  server: {
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: true,
  },
};

export default config;
