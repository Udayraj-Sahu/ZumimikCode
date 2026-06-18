import Dexie, { type Table } from "dexie";

export interface DashboardCache {
  id: string;
  data: unknown;
  updatedAt: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Bookmark {
  id: string;
  type: "topic" | "sprint" | "achievement";
  label: string;
  createdAt: number;
}

class ExamArenaDB extends Dexie {
  dashboardCache!: Table<DashboardCache, string>;
  userData!: Table<UserData, string>;
  bookmarks!: Table<Bookmark, string>;

  constructor() {
    super("ExamArenaDB");
    this.version(1).stores({
      dashboardCache: "id, updatedAt",
      userData: "id",
      bookmarks: "id, type, createdAt",
    });
  }
}

export const db = new ExamArenaDB();
