import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { accountsTable, transactionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { getBankById } from "../lib/banks";

const router: IRouter = Router();

router.use(authenticate);

// Resolve account number to name (simulated)
router.post("/transfers/resolve", async (req, res): Promise<void> => {
  const { bankId, accountNumber } = req.body;
  if (!bankId || !accountNumber) {
    res.status(400).json({ error: "bankId and accountNumber are required" });
    return;
  }

  const bank = getBankById(bankId);
  if (!bank) {
    res.status(400).json({ error: "Invalid bank" });
    return;
  }

  // Simulate account resolution — generate a plausible name
  const NAMES = [
    "Adaeze Okonkwo",
    "Emeka Nwosu",
    "Chisom Eze",
    "Bola Adeyemi",
    "Seun Adesanya",
    "Ngozi Obi",
    "Tunde Bakare",
    "Amina Bello",
    "Kemi Adewale",
    "Obinna Okafor",
    "Funmi Olawale",
    "Chukwuemeka Ifeanyi",
    "Yemi Olatunji",
    "Fatima Sule",
    "David Okonkwo",
  ];

  // Use checksum of account number to deterministically pick a name
  const sum = accountNumber
    .split("")
    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  const name = NAMES[sum % NAMES.length];

  // Simulate a small delay
  await new Promise((r) => setTimeout(r, 400));

  res.json({
    accountName: name,
    accountNumber,
    bankId,
  });
});

// Create a transfer
router.post("/transfers", async (req, res): Promise<void> => {
  const {
    sourceAccountId,
    recipientBank,
    recipientAccountNumber,
    recipientName,
    amount,
    note,
  } = req.body;

  if (!sourceAccountId || !recipientBank || !recipientAccountNumber || !recipientName || !amount) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const transferAmount = parseFloat(String(amount));
  if (isNaN(transferAmount) || transferAmount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  // Get source account
  const [sourceAccount] = await db
    .select()
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.id, Number(sourceAccountId)),
        eq(accountsTable.userId, req.userId!)
      )
    )
    .limit(1);

  if (!sourceAccount) {
    res.status(404).json({ error: "Source account not found" });
    return;
  }

  const currentBalance = parseFloat(sourceAccount.balance);
  if (currentBalance < transferAmount) {
    res.status(400).json({ error: "Insufficient funds" });
    return;
  }

  // Get recipient bank info
  const bank = getBankById(recipientBank);
  const recipientBankName = bank?.name ?? recipientBank;

  // Deduct balance
  const newBalance = currentBalance - transferAmount;
  await db
    .update(accountsTable)
    .set({ balance: String(newBalance.toFixed(2)) })
    .where(eq(accountsTable.id, sourceAccount.id));

  // Create transaction record
  const [tx] = await db
    .insert(transactionsTable)
    .values({
      userId: req.userId!,
      accountId: sourceAccount.id,
      accountName: sourceAccount.accountName,
      bankName: sourceAccount.bankName,
      bankColor: sourceAccount.bankColor,
      type: "debit",
      amount: String(transferAmount.toFixed(2)),
      currency: "NGN",
      description: `Transfer to ${recipientName}`,
      category: null,
      tag: null,
      note: note ?? null,
      recipientName,
      recipientBank: recipientBankName,
    })
    .returning();

  if (!tx) {
    res.status(500).json({ error: "Failed to record transaction" });
    return;
  }

  res.status(201).json({
    transaction: { ...tx, amount: parseFloat(tx.amount) },
    updatedBalance: newBalance,
  });
});

export default router;
