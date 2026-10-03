import { Router } from "express";
import authRouter from "./auth";
import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import transfersRouter from "./transfers";
import dashboardRouter from "./dashboard";
import banksRouter from "./banks";
import usersRouter from "./users";
import healthRouter from "./health";
import aiRouter from "./ai";

const router = Router();

router.use(authRouter);
router.use(accountsRouter);
router.use(transactionsRouter);
router.use(transfersRouter);
router.use(dashboardRouter);
router.use(banksRouter);
router.use(usersRouter);
router.use(healthRouter);
router.use(aiRouter);

export default router;
