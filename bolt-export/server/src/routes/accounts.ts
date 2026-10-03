import { Router, type IRouter } from "express";
import { db, accountsTable } from "../lib/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { getBankById } from "../lib/banks";

const router: IRouter = Router();

router.use(authenticate);

router.get("/accounts", async (req, res): Promise<void> => {
  try {
    const accounts = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, req.userId!))
      .orderBy(accountsTable.createdAt);

    res.json(accounts.map((a) => ({ ...a, balance: parseFloat(a.balance) })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.post("/accounts", async (req, res): Promise<void> => {
  try {
    const { bankId, accountNumber, accountName, balance, accountType, accountSubtype } = req.body;
    if (!bankId || !accountNumber || !accountName || balance == null) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const bank = getBankById(bankId);
    if (!bank) {
      res.status(400).json({ error: "Invalid bank" });
      return;
    }

    const [account] = await db
      .insert(accountsTable)
      .values({
        userId: req.userId!,
        bankId: bank.id,
        bankName: bank.name,
        bankColor: bank.color,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        balance: String(balance),
        currency: "NGN",
        accountType: accountType ?? "checking",
        accountSubtype: accountSubtype ?? null,
      })
      .returning();

    if (!account) {
      res.status(500).json({ error: "Failed to connect account" });
      return;
    }

    res.status(201).json({ ...account, balance: parseFloat(account.balance) });
  } catch (err) {
    res.status(500).json({ error: "Failed to connect account" });
  }
});

router.get("/accounts/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [account] = await db
      .select()
      .from(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, req.userId!)))
      .limit(1);

    if (!account) { res.status(404).json({ error: "Account not found" }); return; }

    res.json({ ...account, balance: parseFloat(account.balance) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

router.delete("/accounts/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [deleted] = await db
      .delete(accountsTable)
      .where(and(eq(accountsTable.id, id), eq(accountsTable.userId, req.userId!)))
      .returning();

    if (!deleted) { res.status(404).json({ error: "Account not found" }); return; }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
