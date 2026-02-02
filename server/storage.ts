import { db } from "./db";
import { sessions, type Session, type InsertSession } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  createSession(): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  updateSession(id: number, data: Partial<InsertSession>): Promise<Session>;
}

export class DatabaseStorage implements IStorage {
  async createSession(): Promise<Session> {
    const [session] = await db.insert(sessions).values({}).returning();
    return session;
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async updateSession(id: number, data: Partial<InsertSession>): Promise<Session> {
    const [updated] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
