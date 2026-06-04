import { Router, type IRouter } from "express";
import { db, accountsTable, transactionsTable } from "../lib/db";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/dashboard", authenticate, async (req, res): Promise<void> => {
  const [accounts, recentTxs] = await Promise.all([
    db.select().from(accountsTable).where(eq(accountsTable.userId, req.userId!)),
    db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, req.userId!))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(10),
  ]);

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);

  res.json({
    totalBalance,
    accountCount: accounts.length,
    currency: "NGN",
    recentTransactions: recentTxs.map((t) => ({ ...t, amount: parseFloat(t.amount) })),
  });
});

export default router;
