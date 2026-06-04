import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const phoneNumbersTable = pgTable("phone_numbers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  label: text("label"),
  isDefault: boolean("is_default").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PhoneNumber = typeof phoneNumbersTable.$inferSelect;
export type InsertPhoneNumber = typeof phoneNumbersTable.$inferInsert;
