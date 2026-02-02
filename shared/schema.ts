import { pgTable, text, serial, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import chat models
export * from "./models/chat";

import { conversations } from "./models/chat";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  question1: text("question1"),
  question2: text("question2"),
  question3: text("question3"),
  question4: text("question4"),
  spiritName: text("spirit_name"),
  spiritTraits: text("spirit_traits"),
  conversationId: integer("conversation_id").references(() => conversations.id),
  isComplete: boolean("is_complete").default(false),
});

export const insertSessionSchema = createInsertSchema(sessions).omit({ 
  id: true,
  isComplete: true,
  spiritName: true, 
  spiritTraits: true,
  conversationId: true
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export const sessionsRelations = relations(sessions, ({ one }) => ({
  conversation: one(conversations, {
    fields: [sessions.conversationId],
    references: [conversations.id],
  }),
}));
