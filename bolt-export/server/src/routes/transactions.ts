import { Router, type IRouter } from "express";
import { db, transactionsTable } from "../lib/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.use(authenticate);

router.get("/transactions", async (req, res): Promise<void> => {
  const accountId = req.query.accountId ? parseInt(String(req.query.accountId), 10) : null;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;

  const conditions = accountId
    ? and(eq(transactionsTable.userId, req.userId!), eq(transactionsTable.accountId, accountId))
    : eq(transactionsTable.userId, req.userId!);

  const txs = await db
    .select()
    .from(transactionsTable)
    .where(conditions)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit);

  res.json(txs.map((t) => ({ ...t, amount: parseFloat(t.amount) })));
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [tx] = await db
    .select()
    .from(transactionsTable)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, req.userId!)))
    .limit(1);

  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  res.json({ ...tx, amount: parseFloat(tx.amount) });
});

router.patch("/transactions/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { category, tag, note } = req.body;
  const updates: Record<string, string | null> = {};
  if (category !== undefined) updates.category = category ?? null;
  if (tag !== undefined) updates.tag = tag ?? null;
  if (note !== undefined) updates.note = note ?? null;

  const [tx] = await db
    .update(transactionsTable)
    .set(updates)
    .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, req.userId!)))
    .returning();

  if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

  res.json({ ...tx, amount: parseFloat(tx.amount) });
});

// Get shared transactions for the user's network
// For MVP, network = user's own shared transactions
router.get("/transactions/shared", async (req, res): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;

    const txs = await db
      .select()
      .from(transactionsTable)
      .where(and(
        eq(transactionsTable.userId, req.userId!),
        eq(transactionsTable.isShared, true)
      ))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit);

    res.json(txs.map((t) => ({ ...t, amount: parseFloat(t.amount) })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shared transactions" });
  }
});

// Toggle shared status of a transaction
router.patch("/transactions/:id/toggle-share", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [tx] = await db
      .select()
      .from(transactionsTable)
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, req.userId!)))
      .limit(1);

    if (!tx) { res.status(404).json({ error: "Transaction not found" }); return; }

    const [updatedTx] = await db
      .update(transactionsTable)
      .set({ isShared: !tx.isShared })
      .where(and(eq(transactionsTable.id, id), eq(transactionsTable.userId, req.userId!)))
      .returning();

    if (!updatedTx) { res.status(500).json({ error: "Failed to update transaction" }); return; }

    res.json({ ...updatedTx, amount: parseFloat(updatedTx.amount) });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle share status" });
  }
});

export default router;
