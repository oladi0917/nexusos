import { db, accountsTable, transactionsTable } from "./db";

const DEMO_ACCOUNTS = [
  {
    bankId: "gtbank",
    bankName: "Guaranty Trust Bank",
    bankColor: "#E74C3C",
    accountNumber: "0123456789",
    balance: "245000.00",
    currency: "NGN",
  },
  {
    bankId: "kuda",
    bankName: "Kuda Bank",
    bankColor: "#52057B",
    accountNumber: "1098765432",
    balance: "87500.50",
    currency: "NGN",
  },
];

const DEMO_TRANSACTIONS = [
  { type: "credit", amount: "150000.00", description: "Monthly Salary", category: "Salary", recipientName: null, recipientBank: null, daysAgo: 2 },
  { type: "debit", amount: "5200.00", description: "Transfer to Amaka Okonkwo", category: null, recipientName: "Amaka Okonkwo", recipientBank: "Access Bank", daysAgo: 3 },
  { type: "debit", amount: "12500.00", description: "Transfer to Chidi Eze", category: null, recipientName: "Chidi Eze", recipientBank: "Zenith Bank", daysAgo: 5 },
  { type: "credit", amount: "25000.00", description: "Freelance Payment", category: "Business Income", recipientName: null, recipientBank: null, daysAgo: 7 },
  { type: "debit", amount: "3800.00", description: "Transfer to Ngozi Adeyemi", category: null, recipientName: "Ngozi Adeyemi", recipientBank: "UBA", daysAgo: 9 },
  { type: "credit", amount: "8000.00", description: "Refund - Online Purchase", category: "Refund", recipientName: null, recipientBank: null, daysAgo: 12 },
  { type: "debit", amount: "45000.00", description: "Rent Payment", category: "Other", recipientName: "Emeka Properties", recipientBank: "First Bank", daysAgo: 14 },
  { type: "credit", amount: "15000.00", description: "Gift from Family", category: "Gift", recipientName: null, recipientBank: null, daysAgo: 18 },
];

export async function seedUserData(
  userId: number,
  firstName: string,
  lastName: string
): Promise<void> {
  const insertedAccounts = await db
    .insert(accountsTable)
    .values(
      DEMO_ACCOUNTS.map((acc) => ({
        userId,
        ...acc,
        accountName: `${firstName} ${lastName}`,
      }))
    )
    .returning();

  const primaryAccount = insertedAccounts[0];
  if (!primaryAccount) return;

  const now = new Date();
  await db.insert(transactionsTable).values(
    DEMO_TRANSACTIONS.map((tx) => {
      const date = new Date(now);
      date.setDate(date.getDate() - tx.daysAgo);
      return {
        userId,
        accountId: primaryAccount.id,
        accountName: primaryAccount.accountName,
        bankName: primaryAccount.bankName,
        bankColor: primaryAccount.bankColor,
        type: tx.type,
        amount: tx.amount,
        currency: "NGN",
        description: tx.description,
        category: tx.category ?? null,
        tag: null,
        note: null,
        recipientName: tx.recipientName ?? null,
        recipientBank: tx.recipientBank ?? null,
        createdAt: date,
      };
    })
  );
}
