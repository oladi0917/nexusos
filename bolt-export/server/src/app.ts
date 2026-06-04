import express, { type Express } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";

const app: Express = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
