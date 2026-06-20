import Dexie, { type Table } from "dexie";

export interface DashboardCache {
  id: string;
  data: unknown;
  updatedAt: number;
}

class ExamArenaDB extends Dexie {
  dashboardCache!: Table<DashboardCache, string>;

  constructor() {
    super("ExamArenaDB");
    this.version(1).stores({
      dashboardCache: "id, updatedAt",
    });
  }
}

export const db = new ExamArenaDB();
