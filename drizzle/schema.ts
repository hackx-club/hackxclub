import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  college: text("college").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  team_size: integer("team_size").notNull(),
  track: text("track").notNull(),
  event_slug: text("event_slug").notNull().default("hackx-1-0"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
