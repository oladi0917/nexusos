import { Router, type IRouter } from "express";
import { db, usersTable } from "../lib/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken } from "../lib/auth";
import { authenticate } from "../middlewares/authenticate";
import { seedUserData } from "../lib/seed";

const router: IRouter = Router();

router.post("/auth/signup", async (req, res): Promise<void> => {
  const { firstName, lastName, email, password, phone } = req.body;
  if (!firstName || !lastName || !email || !password || !phone) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const hashed = await hashPassword(password);
  // Generate a unique financial ID
  const financialId = `NX${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const [user] = await db
    .insert(usersTable)
    .values({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone: phone.trim(),
      financial_id: financialId,
      credit_score: null, // Initialize as null, to be updated later by credit scoring system
    })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create account" });
    return;
  }

  try {
    await seedUserData(user.id, user.firstName, user.lastName);
  } catch (e) {
    console.warn("Failed to seed demo data:", e);
  }

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      financialId: user.financial_id,
      creditScore: user.credit_score,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    financialId: user.financial_id,
    creditScore: user.credit_score,
    createdAt: user.createdAt,
  });
});

export default router;
