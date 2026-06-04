import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { cardsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate";

const router: IRouter = Router();

router.use(authenticate);

router.get("/cards", async (req, res): Promise<void> => {
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.userId, req.userId!))
    .orderBy(cardsTable.createdAt);
  res.json(cards);
});

router.post("/cards", async (req, res): Promise<void> => {
  const { cardNumber, expiresMonth, expiresYear, cvv, cardholderName } = req.body;
  if (!cardNumber || !expiresMonth || !expiresYear || !cvv || !cardholderName) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const cleaned = String(cardNumber).replace(/\s/g, "");
  if (cleaned.length < 13 || cleaned.length > 19) {
    res.status(400).json({ error: "Invalid card number" });
    return;
  }

  const last4 = cleaned.slice(-4);
  const firstDigit = cleaned[0];
  let brand = "VERVE";
  if (firstDigit === "4") brand = "VISA";
  else if (firstDigit === "5" || firstDigit === "2") brand = "MASTERCARD";

  const [card] = await db
    .insert(cardsTable)
    .values({
      userId: req.userId!,
      last4,
      brand,
      cardholderName: String(cardholderName).trim().toUpperCase(),
      expiresMonth: String(expiresMonth).padStart(2, "0"),
      expiresYear: String(expiresYear),
      isActive: true,
    })
    .returning();

  if (!card) {
    res.status(500).json({ error: "Failed to add card" });
    return;
  }

  res.status(201).json(card);
});

router.delete("/cards/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db
    .delete(cardsTable)
    .where(and(eq(cardsTable.id, id), eq(cardsTable.userId, req.userId!)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Card not found" }); return; }

  res.sendStatus(204);
});

export default router;
