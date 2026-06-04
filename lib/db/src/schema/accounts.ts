import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bankId: text("bank_id").notNull(),
  bankName: text("bank_name").notNull(),
  bankColor: text("bank_color").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("NGN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
