import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { walletTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.use(authenticate);

async function ensureWallet(userId: number) {
  const existing = await db
    .select()
    .from(walletTable)
    .where(eq(walletTable.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(walletTable)
    .values({ userId, balance: "0", currency: "NGN" })
    .returning();
  return created!;
}

router.get("/wallet", async (req, res): Promise<void> => {
  const wallet = await ensureWallet(req.userId!);
  res.json({ ...wallet, balance: parseFloat(wallet.balance) });
});

router.post("/wallet/fund", async (req, res): Promise<void> => {
  const { amount } = req.body;
  const fundAmount = parseFloat(String(amount));
  if (isNaN(fundAmount) || fundAmount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  const wallet = await ensureWallet(req.userId!);
  const newBalance = parseFloat(wallet.balance) + fundAmount;

  const [updated] = await db
    .update(walletTable)
    .set({ balance: String(newBalance.toFixed(2)) })
    .where(eq(walletTable.userId, req.userId!))
    .returning();

  res.json({ ...updated, balance: parseFloat(updated!.balance) });
});

export default router;
