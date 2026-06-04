import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  bankColor: text("bank_color").notNull(),
  type: text("type").notNull(), // 'credit' | 'debit'
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  description: text("description").notNull(),
  category: text("category"),
  tag: text("tag"),
  note: text("note"),
  recipientName: text("recipient_name"),
  recipientBank: text("recipient_bank"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
