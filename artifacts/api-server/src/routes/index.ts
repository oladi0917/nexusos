import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import banksRouter from "./banks";
import accountsRouter from "./accounts";
import transactionsRouter from "./transactions";
import transfersRouter from "./transfers";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import cardsRouter from "./cards";
import walletRouter from "./wallet";
import phoneNumbersRouter from "./phone-numbers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(banksRouter);
router.use(accountsRouter);
router.use(transactionsRouter);
router.use(transfersRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(cardsRouter);
router.use(walletRouter);
router.use(phoneNumbersRouter);

export default router;
