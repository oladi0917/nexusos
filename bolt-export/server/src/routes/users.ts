import { Router, type IRouter } from "express";
import { db, usersTable } from "../lib/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.use(authenticate);

router.get("/users/profile", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    bvn: user.bvn,
    address: user.address,
    createdAt: user.createdAt,
  });
});

router.patch("/users/profile", async (req, res): Promise<void> => {
  const { firstName, lastName, phone, address } = req.body;
  const updates: Record<string, string> = {};
  if (firstName) updates.firstName = firstName.trim();
  if (lastName) updates.lastName = lastName.trim();
  if (phone) updates.phone = phone.trim();
  if (address) updates.address = address.trim();

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.userId!))
    .returning();

  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    bvn: user.bvn,
    address: user.address,
    createdAt: user.createdAt,
  });
});

export default router;
