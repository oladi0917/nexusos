import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";

export const walletTable = pgTable("wallet", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("NGN"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Wallet = typeof walletTable.$inferSelect;
