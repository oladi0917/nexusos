import { Router, type IRouter } from "express";
import { db, usersTable, accountsTable, transactionsTable } from "../lib/db";
import { eq, and, avg, sum, count, sql } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.use(authenticate);

// Get credit score and factors influencing it
router.get("/credit-score", async (req, res): Promise<void> => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // In a real implementation, this would use ML models or complex algorithms
    // For now, we'll simulate a credit score based on transaction history
    const creditScore = await calculateCreditScore(req.userId!);

    // Update the credit score in the database
    await db
      .update(usersTable)
      .set({ credit_score: creditScore })
      .where(eq(usersTable.id, req.userId!));

    res.json({
      creditScore,
      factors: [
        { name: "Payment History", impact: "positive", score: 85 },
        { name: "Credit Utilization", impact: "positive", score: 78 },
        { name: "Length of Credit History", impact: "neutral", score: 60 },
        { name: "Recent Credit Inquiries", impact: "negative", score: 45 },
        { name: "Credit Mix", impact: "positive", score: 70 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate credit score" });
  }
});

// Get financial insights and analytics
router.get("/insights", async (req, res): Promise<void> => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get transaction data for analysis
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, req.userId!))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(100); // Last 100 transactions

    // Calculate insights
    const insights = generateFinancialInsights(transactions);

    res.json({
      insights,
      summary: {
        totalTransactions: transactions.length,
        totalIncome: transactions
          .filter(t => t.type === "credit")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalExpenses: transactions
          .filter(t => t.type === "debit")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        averageTransaction: transactions.length > 0
          ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length
          : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Get AI-prepared actions for user review
router.get("/actions", async (req, res): Promise<void> => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Get transaction data for action preparation
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, req.userId!))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(50);

    // Generate AI-prepared actions
    const actions = prepareAIActions(transactions, user);

    res.json({ actions });
  } catch (err) {
    res.status(500).json({ error: "Failed to prepare AI actions" });
  }
});

// Helper function to calculate credit score based on transaction history
async function calculateCreditScore(userId: number): Promise<number> {
  try {
    // Get user's transactions for analysis
    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.userId, userId))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(100); // Last 100 transactions

    if (transactions.length === 0) {
      // Default score for new users
      return 600;
    }

    // Calculate various factors that influence credit score
    const paymentHistoryScore = calculatePaymentHistoryScore(transactions);
    const creditUtilizationScore = await calculateCreditUtilizationScore(userId);
    const lengthOfHistoryScore = calculateLengthOfHistoryScore(transactions);
    const recentInquiriesScore = 80; // Placeholder - would be based on actual inquiries
    const creditMixScore = calculateCreditMixScore(transactions);

    // Weighted average of factors (typical FICO weights)
    const creditScore = Math.round(
      paymentHistoryScore * 0.35 + // Payment history: 35%
      creditUtilizationScore * 0.30 + // Credit utilization: 30%
      lengthOfHistoryScore * 0.15 + // Length of history: 15%
      recentInquiriesScore * 0.10 + // Recent inquiries: 10%
      creditMixScore * 0.10 // Credit mix: 10%
    );

    // Ensure score is within valid range
    return Math.min(850, Math.max(300, creditScore));
  } catch (error) {
    console.error('Error calculating credit score:', error);
    // Fallback to basic calculation if error occurs
    const baseScore = 600;
    const variation = (userId % 200);
    return Math.min(850, Math.max(300, baseScore + variation));
  }
}

// Calculate payment history score based on transaction timeliness and consistency
function calculatePaymentHistoryScore(transactions: any[]): number {
  if (transactions.length === 0) return 50;

  // For simplicity, we'll assume all transactions in our system are "on time"
  // In a real system, we'd check due dates vs payment dates
  // Since we don't have that data, we'll base it on consistency of income/expenses

  const credits = transactions.filter(t => t.type === 'credit');
  const debits = transactions.filter(t => t.type === 'debit');

    // If we have regular income transactions, score higher
    const incomeRegularityScore = credits.length > 0 ?
      Math.min(90, 60 + (credits.length * 2)) : 50;

    // Regular expenses also indicate financial activity
    const expenseRegularityScore = debits.length > 0 ?
      Math.min(85, 50 + (debits.length * 1.5)) : 40;

    return Math.min(95, Math.max(30, (incomeRegularityScore + expenseRegularityScore) / 2));
}

// Calculate credit utilization score based on account balances
async function calculateCreditUtilizationScore(userId: number): Promise<number> {
  try {
    // Get user's accounts to calculate utilization
    const accounts = await db
      .select({
        balance: accountsTable.balance,
        accountType: accountsTable.accountType
      })
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId));

    if (accounts.length === 0) return 50; // Default if no accounts

    // For simplicity, we'll assume a ideal utilization is under 30%
    // Since we don't have credit limits in our current schema,
    // we'll use account balances as a proxy for financial responsibility

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    const avgBalance = totalBalance / accounts.length;

    // Higher average balance suggests better financial management
    // Normalize to a 0-100 score where higher is better
    // Assuming $5000+ average balance is excellent, $0 is poor
    const utilizationScore = Math.min(90, Math.max(30, 50 + (avgBalance / 100)));

    return utilizationScore;
  } catch (error) {
    console.error('Error calculating credit utilization:', error);
    return 50;
  }
}

// Calculate length of credit history score based on account age
function calculateLengthOfHistoryScore(transactions: any[]): number {
  if (transactions.length === 0) return 30;

  // Get the oldest and newest transaction dates
  const dates = transactions.map(t => new Date(t.createdAt));
  const oldestDate = Math.min(...dates.map(d => d.getTime()));
  const newestDate = Math.max(...dates.map(d => d.getTime()));

  // Calculate history length in days
  const historyLengthDays = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);

  // Convert to score: longer history = better score
  // 0-30 days: 30-50, 30-90 days: 50-70, 90+ days: 70-90
  if (historyLengthDays < 30) {
    return 30 + (historyLengthDays / 30) * 20;
  } else if (historyLengthDays < 90) {
    return 50 + ((historyLengthDays - 30) / 60) * 20;
  } else {
    return Math.min(90, 70 + ((historyLengthDays - 90) / 365) * 20);
  }
}

// Calculate credit mix score based on variety of transaction types
function calculateCreditMixScore(transactions: any[]): number {
  if (transactions.length === 0) return 40;

  // Count different transaction types/categories
  const categories = new Set();
  const types = new Set();

  transactions.forEach(t => {
    if (t.category) categories.add(t.category);
    types.add(t.type); // credit or debit
  });

  // More diverse mix = better score
  const categoryScore = Math.min(90, 40 + (categories.size * 10));
  const typeScore = types.size === 2 ? 80 : 50; // Both credit and debit is ideal

  return Math.min(90, (categoryScore + typeScore) / 2);
}

// Helper function to generate financial insights
function generateFinancialInsights(transactions: any[]) {
  if (transactions.length === 0) {
    return [
      {
        id: 1,
        title: "Getting Started",
        description: "Start adding transactions to see personalized insights",
        type: "info" as const,
        actionable: false
      }
    ];
  }

  const incomeTransactions = transactions.filter(t => t.type === "credit");
  const expenseTransactions = transactions.filter(t => t.type === "debit");

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpenses;
  const averageTransaction = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length
    : 0;

  const insights = [];

  // Income vs Expenses insight
  if (totalIncome > 0 || totalExpenses > 0) {
    const ratio = totalExpenses > 0 ? (totalIncome / totalExpenses) * 100 : 0;

    if (ratio > 120) {
      insights.push({
        id: 1,
        title: "Strong Income-to-Expense Ratio",
        description: `Your income is ${ratio.toFixed(0)}% of your expenses, indicating healthy financial management`,
        type: "positive" as const,
        actionable: false
      });
    } else if (ratio < 80) {
      insights.push({
        id: 1,
        title: "Income-to-Expense Ratio Needs Improvement",
        description: `Your income is only ${ratio.toFixed(0)}% of your expenses. Consider increasing income or reducing expenses`,
        type: "negative" as const,
        actionable: true
      });
    } else {
      insights.push({
        id: 1,
        title: "Balanced Income-to-Expense Ratio",
        description: `Your income and expenses are well balanced at ${ratio.toFixed(0)}%`,
        type: "info" as const,
        actionable: false
      });
    }
  }

  // Savings rate insight
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;

    if (savingsRate >= 20) {
      insights.push({
        id: 2,
        title: "Excellent Savings Rate",
        description: `You're saving ${savingsRate.toFixed(0)}% of your income, which is excellent for long-term financial health`,
        type: "positive" as const,
        actionable: true
      });
    } else if (savingsRate >= 10) {
      insights.push({
        id: 2,
        title: "Good Savings Rate",
        description: `You're saving ${savingsRate.toFixed(0)}% of your income. Consider increasing to 20%+ for optimal growth`,
        type: "positive" as const,
        actionable: true
      });
    } else if (savingsRate > 0) {
      insights.push({
        id: 2,
        title: "Developing Savings Habit",
        description: `You're saving ${savingsRate.toFixed(0)}% of your income. Try to gradually increase this percentage`,
        type: "info" as const,
        actionable: true
      });
    } else if (savingsRate < 0) {
      insights.push({
        id: 2,
        title: "Negative Savings Rate",
        description: `You're spending ${Math.abs(savingsRate).toFixed(0)}% more than you earn. Review your expenses to get back on track`,
        type: "negative" as const,
        actionable: true
      });
    }
  }

  // Transaction frequency insight
  const transactionsPerWeek = transactions.length > 0 ?
    (transactions.length / ((Math.max(...transactions.map(t => new Date(t.createdAt)).getTime()) -
      Math.min(...transactions.map(t => new Date(t.createdAt)).getTime())) / (1000 * 60 * 60 * 24 * 7)) || 0 : 0;

  if (transactionsPerWeek > 0) {
    if (transactionsPerWeek >= 3) {
      insights.push({
        id: 3,
        title: "Active Financial Tracking",
        description: `You're averaging ${transactionsPerWeek.toFixed(1)} transactions per week, showing good financial engagement`,
        type: "positive" as const,
        actionable: false
      });
    } else if (transactionsPerWeek >= 1) {
      insights.push({
        id: 3,
        title: "Regular Financial Tracking",
        description: `You're averaging ${transactionsPerWeek.toFixed(1)} transactions per week. Consider tracking more frequently for better insights`,
        type: "info" as const,
        actionable: false
      });
    } else {
      insights.push({
        id: 3,
        title: "Infrequent Financial Tracking",
        description: `You're averaging only ${transactionsPerWeek.toFixed(1)} transactions per week. More frequent tracking can improve financial awareness`,
        type: "info" as const,
        actionable: true
      });
    }
  }

  // Average transaction insight
  if (averageTransaction > 0) {
    insights.push({
      id: 4,
      title: "Average Transaction Size",
      description: `Your average transaction is $${averageTransaction.toFixed(2)}`,
      type: "info" as const,
      actionable: false
    });
  }

  // Income stability insight
  if (incomeTransactions.length >= 3) {
    // Calculate variance in income amounts to assess stability
    const incomeAmounts = incomeTransactions.map(t => Number(t.amount));
    const meanIncome = incomeAmounts.reduce((sum, val) => sum + val, 0) / incomeAmounts.length;
    const variance = incomeAmounts.reduce((sum, val) => sum + Math.pow(val - meanIncome, 2), 0) / incomeAmounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = meanIncome > 0 ? (stdDev / meanIncome) * 100 : 0;

    if (coefficientOfVariation < 30) {
      insights.push({
        id: 5,
        title: "Stable Income Pattern",
        description: `Your income shows a stable pattern with low variance (${coefficientOfVariation.toFixed(0)}% coefficient of variation)`,
        type: "positive" as const,
        actionable: false
      });
    } else if (coefficientOfVariation < 60) {
      insights.push({
        id: 5,
        title: "Moderately Stable Income",
        description: `Your income shows moderate stability (${coefficientOfVariation.toFixed(0)}% coefficient of variation)`,
        type: "info" as const,
        actionable: false
      });
    } else {
      insights.push({
        id: 5,
        title: "Variable Income Pattern",
        description: `Your income shows high variance (${coefficientOfVariation.toFixed(0)}% coefficient of variation). Consider building a larger emergency fund`,
        type: "info" as const,
        actionable: true
      });
    }
  }

  // Expense categorization insight
  if (expenseTransactions.length >= 5) {
    // Group expenses by category
    const expenseByCategory = expenseTransactions.reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Get top 3 expense categories
    const sortedCategories = Object.entries(expenseByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      const topCategoryPercentage = (topCategory[1] / totalExpenses) * 100;

      insights.push({
        id: 6,
        title: "Top Expense Category",
        description: `Your largest expense category is "${topCategory[0]}" at $${topCategory[1].toFixed(2)} (${topCategoryPercentage.toFixed(0)}% of expenses)`,
        type: "info" as const,
        actionable: topCategoryPercentage > 50 ? true : false
      });
    }
  }

  // If no specific insights were added, add a general one
  if (insights.length === 0) {
    insights.push({
      id: 7,
      title: "Start Tracking More",
      description: "Continue tracking your transactions to receive more personalized financial insights",
      type: "info" as const,
      actionable: false
    });
  }

  return insights;
}

// Helper function to prepare AI actions
function prepareAIActions(transactions: any[], user: any) {
  const actions = [];

  if (transactions.length === 0) {
    // No transactions yet
    actions.push({
      id: 1,
      title: "Get Started",
      description: "Add your first transaction to begin receiving personalized AI insights",
      type: "info",
      icon: "Plus",
      estimatedSavings: 0
    });
    return actions;
  }

  const incomeTransactions = transactions.filter(t => t.type === "credit");
  const expenseTransactions = transactions.filter(t => t.type === "debit");

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpenses;

  // Action 1: Subscription optimization (if we detect recurring expenses)
  const recurringExpenses = detectRecurringExpenses(expenseTransactions);
  if (recurringExpenses.length > 0) {
    const estimatedSavings = recurringExpenses.reduce((sum, exp) => sum + (exp.averageAmount * 0.3), 0); // Assume 30% savings potential
    actions.push({
      id: 1,
      title: "Subscription Optimization",
      description: `AI detected ${recurringExpenses.length} potential recurring subscriptions. Optimizing these could save approximately $${estimatedSavings.toFixed(0)}/month`,
      type: "suggestion",
      icon: "Settings",
      estimatedSavings: parseFloat(estimatedSavings.toFixed(0))
    });
  }

  // Action 2: Bill negotiation opportunity (based on high expenses in certain categories)
  const highExpenseCategories = detectHighExpenseCategories(expenseTransactions, totalExpenses);
  if (highExpenseCategories.length > 0) {
    const estimatedSavings = highExpenseCategories.reduce((sum, cat) => sum + (cat.amount * 0.15), 0); // Assume 15% savings potential
    actions.push({
      id: 2,
      title: "Bill Negotiation Opportunity",
      description: `Your expenses in ${highExpenseCategories.map(c => c.category).join(', ')} are above typical ranges. AI has prepared negotiation strategies`,
      type: "suggestion",
      icon: "Phone",
      estimatedSavings: parseFloat(estimatedSavings.toFixed(0))
    });
  }

  // Action 3: Investment opportunity (if user has positive cash flow)
  if (netFlow > 0 && incomeTransactions.length >= 2) {
    const monthlySurplus = netFlow;
    const investmentSuggestion = monthlySurplus >= 100 ?
      `Consider allocating $${Math.min(monthlySurplus * 0.5, 500).toFixed(0)}/month to a diversified investment portfolio` :
      `Start with small investments: consider $${Math.min(monthlySurplus * 0.3, 100).toFixed(0)}/month in low-cost index funds`;

    actions.push({
      id: 3,
      title: "Investment Opportunity",
      description: investmentSuggestion,
      type: "suggestion",
      icon: "TrendingUp",
      estimatedReturn: "5-7% annually"
    });
  }

  // Action 4: Emergency fund recommendation
  const essentialExpenses = estimateEssentialExpenses(expenseTransactions);
  const monthsOfExpenses = essentialExpenses > 0 ? (totalIncome / essentialExpenses) : 0;

  if (monthsOfExpenses < 3) {
    const emergencyFundTarget = essentialExpenses * 3;
    const currentSavingsRate = Math.max(0, netFlow);
    const monthsToFund = currentSavingsRate > 0 ? emergencyFundTarget / currentSavingsRate : 0;

    actions.push({
      id: 4,
      title: "Emergency Fund Building",
      description: `Your emergency fund covers approximately ${monthsOfExpenses.toFixed(1)} months of essential expenses. Aim for 3-6 months (target: $${emergencyFundTarget.toFixed(0)})`,
      type: monthsOfExpenses < 1 ? "warning" : "suggestion",
      icon: "Shield",
      estimatedSavings: 0
    });
  } else if (monthsOfExpenses >= 3 && monthsOfExpenses < 6) {
    actions.push({
      id: 4,
      title: "Emergency Fund Status",
      description: `Good! Your emergency fund covers ${monthsOfExpenses.toFixed(1)} months of expenses. Consider building to 6 months for optimal protection`,
      type: "info",
      icon: "Shield",
      estimatedSavings: 0
    });
  }

  // Action 5: Income optimization (if income is irregular or low)
  if (incomeTransactions.length > 0) {
    const incomeStability = calculateIncomeStability(incomeTransactions);
    if (incomeStability < 0.7 || totalIncome < 2000) { // Arbitrary thresholds
      actions.push({
        id: 5,
        title: "Income Optimization",
        description: "Consider developing additional income streams or negotiating current compensation for greater financial stability",
        type: "suggestion",
        icon: "Upload",
        estimatedSavings: 0
      });
    }
  }

  // If no specific actions were generated, add a general one
  if (actions.length === 0) {
    actions.push({
      id: 99,
      title: "Financial Health Check",
      description: "Your finances look good! Continue monitoring your transactions for ongoing insights",
      type: "info",
      icon: "CheckCircle",
      estimatedSavings: 0
    });
  }

  return actions;
}

// Helper function to detect recurring expenses
function detectRecurringExpenses(expenseTransactions: any[]): Array<{category: string; averageAmount: number; count: number}> {
  // Group by category and look for similar amounts occurring regularly
  const categorizedExpenses: Record<string, number[]> = {};

  expenseTransactions.forEach(t => {
    const category = t.category || 'Uncategorized';
    if (!categorizedExpenses[category]) {
      categorizedExpenses[category] = [];
    }
    categorizedExpenses[category].push(Number(t.amount));
  });

  const recurring: Array<{category: string; averageAmount: number; count: number}> = [];

  Object.entries(categorizedExpenses).forEach(([category, amounts]) => {
    if (amounts.length >= 3) { // At least 3 transactions in category
      const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      // Check if amounts are relatively consistent (low variance)
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);
      const consistency = avgAmount > 0 ? (1 - (stdDev / avgAmount)) : 0;

      if (consistency > 0.7 && amounts.length >= 3) { // Consistent amounts
        recurring.push({
          category,
          averageAmount: avgAmount,
          count: amounts.length
        });
      }
    }
  });

  return recurring;
}

// Helper function to detect high expense categories
function detectHighExpenseCategories(expenseTransactions: any[], totalExpenses: number): Array<{category: string; amount: number; percentage: number}> {
  // Group by category
  const expensesByCategory: Record<string, number> = {};

  expenseTransactions.forEach(t => {
    const category = t.category || 'Uncategorized';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(t.amount);
  });

  // Calculate percentages and flag high ones (>30% of total expenses in one category)
  const highCategories: Array<{category: string; amount: number; percentage: number}> = [];

  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    const percentage = (amount / totalExpenses) * 100;
    if (percentage > 30) { // More than 30% in one category is worth investigating
      highCategories.push({
        category,
        amount,
        percentage
      });
    }
  });

  return highCategories.sort((a, b) => b.percentage - a.percentage);
}

// Helper function to estimate essential expenses
function estimateEssentialExpenses(expenseTransactions: any[]): number {
  // Define essential categories (simplified)
  const essentialCategories = new Set(['Housing', 'Utilities', 'Groceries', 'Transportation', 'Insurance', 'Healthcare']);

  let essentialTotal = 0;
  expenseTransactions.forEach(t => {
    const category = t.category || '';
    if (essentialCategories.has(category)) {
      essentialTotal += Number(t.amount);
    }
  });

  return essentialTotal;
}

// Helper function to calculate income stability
function calculateIncomeStability(incomeTransactions: any[]): number {
  if (incomeTransactions.length < 2) return 0;

  const amounts = incomeTransactions.map(t => Number(t.amount));
  const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;

  if (mean === 0) return 0;

  // Calculate coefficient of variation (lower = more stable)
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Convert to stability score (0-1, where 1 is perfectly stable)
  return Math.max(0, 1 - Math.min(cv, 1));
}

export default router;