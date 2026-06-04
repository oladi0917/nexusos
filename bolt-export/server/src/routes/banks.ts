import { Router, type IRouter } from "express";
import { getBanks } from "../lib/banks";

const router: IRouter = Router();

router.get("/banks", (_req, res): void => {
  res.json(getBanks());
});

export default router;
