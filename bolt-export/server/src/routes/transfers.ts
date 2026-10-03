import { Router, type IRouter } from "express";
import { db, accountsTable, transactionsTable } from "../lib/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";
import { getBankById } from "../lib/banks";

const router: IRouter = Router();

router.use(authenticate);

const NAMES = [
  "Adaeze Okonkwo", "Emeka Nwosu", "Chisom Eze", "Bola Adeyemi", "Seun Adesanya",
  "Ngozi Obi", "Tunde Bakare", "Amina Bello", "Kemi Adewale", "Obinna Okafor",
  "Funmi Olawale", "Chukwuemeka Ifeanyi", "Yemi Olatunji", "Fatima Sule", "David Okonkwo",
];

router.post("/transfers/resolve", async (req, res): Promise<void> => {
  try {
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

    const sum = String(accountNumber)
      .split("")
      .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const name = NAMES[sum % NAMES.length];

    await new Promise((r) => setTimeout(r, 400));

    res.json({ accountName: name, accountNumber, bankId });
  } catch (err) {
    res.status(500).json({ error: "Failed to resolve account" });
  }
});

router.post("/transfers", async (req, res): Promise<void> => {
  const {
    sourceAccountIds,
    amounts,
    recipientBankId,
    recipientAccountNumber,
    recipientName,
    note
  } = req.body;

  // Validate required fields
  if (!sourceAccountIds || !Array.isArray(sourceAccountIds) || sourceAccountIds.length === 0 ||
      !amounts || !Array.isArray(amounts) || amounts.length === 0 ||
      !recipientBankId || !recipientAccountNumber || !recipientName) {
    res.status(400).json({ error: "sourceAccountIds, amounts, recipientBankId, recipientAccountNumber, and recipientName are required" });
    return;
  }

  // Validate arrays have same length
  if (sourceAccountIds.length !== amounts.length) {
    res.status(400).json({ error: "sourceAccountIds and amounts arrays must have the same length" });
    return;
  }

  // Validate amounts are positive numbers
  const validAmounts = amounts.map((amt, index) => {
    const amountNum = parseFloat(String(amt));
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({ error: `Invalid amount at index ${index}` });
      return null;
    }
    return amountNum;
  });

  // Check if any validation failed
  if (validAmounts.some(amt => amt === null)) {
    return; // Error already sent
  }

  const totalAmount = validAmounts.reduce((sum, amt) => sum + amt, 0);
  if (totalAmount <= 0) {
    res.status(400).json({ error: "Total amount must be greater than zero" });
    return;
  }

  // Fetch and validate all source accounts
  const sourceAccounts = await Promise.all(
    sourceAccountIds.map((accountId) =>
      db
        .select()
        .from(accountsTable)
        .where(and(eq(accountsTable.id, Number(accountId)), eq(accountsTable.userId, req.userId!)))
        .limit(1)
    )
  );

  // Check if all accounts were found and belong to user
  const accountsWithIndex = sourceAccounts.map((acc, index) => acc[0] ?? null);
  const missingAccounts = accountsWithIndex
    .map((acc, index) => acc === null ? index : -1)
    .filter(index => index !== -1);

  if (missingAccounts.length > 0) {
    res.status(404).json({ error: `Source account(s) not found or not owned by user at index ${missingAccounts.join(", ")}` });
    return;
  }

  // Check sufficient funds for each account
  const insufficientFundsAccounts = accountsWithIndex
    .map((acc, index) => {
      const balance = parseFloat(acc!.balance);
      const amount = validAmounts[index];
      return balance < amount ? index : -1;
    })
    .filter(index => index !== -1);

  if (insufficientFundsAccounts.length > 0) {
    res.status(400).json({ error: `Insufficient funds in account(s) at index ${insufficientFundsAccounts.join(", ")}` });
    return;
  }

  // Get recipient bank info
  const bank = getBankById(recipientBankId);
  const recipientBankName = bank?.name ?? recipientBankId;

  // Deduct amounts from each source account
  // We update all accounts in parallel, then create a single transaction record
  // for the total amount (MVP approach - alternative: create separate transactions)

  // Deduct amounts from each source account
  const updatePromises = accountsWithIndex.map((acc, index) => {
    const newBalance = parseFloat(acc!.balance) - validAmounts[index];
    return db
      .update(accountsTable)
      .set({ balance: String(newBalance.toFixed(2)) })
      .where(eq(accountsTable.id, acc!.id));
  });

  await Promise.all(updatePromises);

  // Create a single transaction record for the transfer
  // We'll use the first source account as the primary account for the transaction record
  const primaryAccount = accountsWithIndex[0]!;

  const [tx] = await db
    .insert(transactionsTable)
    .values({
      userId: req.userId!,
      accountId: primaryAccount.id,
      accountName: primaryAccount.accountName,
      bankName: primaryAccount.bankName,
      bankColor: primaryAccount.bankColor,
      type: "debit",
      amount: String(totalAmount.toFixed(2)),
      currency: "NGN",
      description: recipientName ? `Transfer to ${recipientName}` : "Transfer",
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
    // For multi-source, we don't have a single updated balance to return
    // Returning the primary account's updated balance for compatibility with existing clients
    updatedBalance: parseFloat(primaryAccount.balance) - validAmounts[0],
  });
});

export default router;
