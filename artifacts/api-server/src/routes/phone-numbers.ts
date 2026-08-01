import { Router, type IRouter } from "express";
import { db, phoneNumbersTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.get("/phone-numbers", authenticate, async (req, res): Promise<void> => {
  const numbers = await db
    .select()
    .from(phoneNumbersTable)
    .where(eq(phoneNumbersTable.userId, req.userId!))
    .orderBy(phoneNumbersTable.createdAt);
  res.json(numbers);
});

router.post("/phone-numbers/request-otp", authenticate, async (req, res): Promise<void> => {
  const { number } = req.body;
  if (!number) {
    res.status(400).json({ error: "Phone number is required" });
    return;
  }
  const cleaned = number.replace(/\s+/g, "");
  if (!/^0[7-9][0-1]\d{8}$/.test(cleaned) && !/^\+234\d{10}$/.test(cleaned)) {
    res.status(400).json({ error: "Please enter a valid Nigerian phone number" });
    return;
  }
  const existing = await db
    .select({ id: phoneNumbersTable.id })
    .from(phoneNumbersTable)
    .where(and(eq(phoneNumbersTable.userId, req.userId!), eq(phoneNumbersTable.number, cleaned)))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "This number is already linked to your account" });
    return;
  }
  res.json({ success: true, message: "OTP sent to " + cleaned });
});

router.post("/phone-numbers/verify-otp", authenticate, async (req, res): Promise<void> => {
  const { number, otp, label } = req.body;
  if (!number || !otp) {
    res.status(400).json({ error: "Number and OTP are required" });
    return;
  }
  if (otp.length < 4) {
    res.status(400).json({ error: "Invalid OTP" });
    return;
  }
  const cleaned = number.replace(/\s+/g, "");
  const existingNumbers = await db
    .select({ id: phoneNumbersTable.id, isDefault: phoneNumbersTable.isDefault })
    .from(phoneNumbersTable)
    .where(eq(phoneNumbersTable.userId, req.userId!));
  const isFirst = existingNumbers.length === 0;
  const [newNumber] = await db
    .insert(phoneNumbersTable)
    .values({
      userId: req.userId!,
      number: cleaned,
      label: label ?? null,
      isDefault: isFirst,
      isVerified: true,
    })
    .returning();
  res.status(201).json(newNumber);
});

router.delete("/phone-numbers/:id", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [deleted] = await db
    .delete(phoneNumbersTable)
    .where(and(eq(phoneNumbersTable.id, id), eq(phoneNumbersTable.userId, req.userId!)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Phone number not found" }); return; }
  if (deleted.isDefault) {
    const remaining = await db
      .select()
      .from(phoneNumbersTable)
      .where(eq(phoneNumbersTable.userId, req.userId!))
      .limit(1);
    if (remaining[0]) {
      await db.update(phoneNumbersTable)
        .set({ isDefault: true })
        .where(eq(phoneNumbersTable.id, remaining[0].id));
    }
  }
  res.json({ success: true });
});

router.patch("/phone-numbers/:id/default", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const target = await db
    .select()
    .from(phoneNumbersTable)
    .where(and(eq(phoneNumbersTable.id, id), eq(phoneNumbersTable.userId, req.userId!)))
    .limit(1);
  if (!target[0]) { res.status(404).json({ error: "Phone number not found" }); return; }
  await db.update(phoneNumbersTable)
    .set({ isDefault: false })
    .where(eq(phoneNumbersTable.userId, req.userId!));
  await db.update(phoneNumbersTable)
    .set({ isDefault: true })
    .where(eq(phoneNumbersTable.id, id));
  res.json({ success: true });
});

router.patch("/phone-numbers/:id/label", authenticate, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const { label } = req.body;
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [updated] = await db
    .update(phoneNumbersTable)
    .set({ label })
    .where(and(eq(phoneNumbersTable.id, id), eq(phoneNumbersTable.userId, req.userId!)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Phone number not found" }); return; }
  res.json(updated);
});

export default router;
