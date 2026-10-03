import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  pgTable,
  text,
  serial,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";

const pool = new Pool({
  connectionString: process.env["DATABASE_URL"],
});

export const db = drizzle(pool);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  bvn: text("bvn"),
  address: text("address"),
  financial_id: text("financial_id").unique(),
  credit_score: integer("credit_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  accountType: text("account_type").notNull().default('checking'),
  accountSubtype: text("account_subtype"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountId: integer("account_id").notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  bankColor: text("bank_color").notNull(),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("NGN"),
  description: text("description").notNull(),
  category: text("category"),
  tag: text("tag"),
  note: text("note"),
  recipientName: text("recipient_name"),
  recipientBank: text("recipient_bank"),
  isShared: boolean("is_shared").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type Account = typeof accountsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
