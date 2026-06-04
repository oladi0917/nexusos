import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  last4: text("last4").notNull(),
  brand: text("brand").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  expiresMonth: text("expires_month").notNull(),
  expiresYear: text("expires_year").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Card = typeof cardsTable.$inferSelect;
