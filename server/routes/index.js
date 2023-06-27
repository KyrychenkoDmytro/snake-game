import { Router } from "express";
import playerRouter from "./playerRouter.js";

const router = new Router();

router.use('/player', playerRouter);

export default router;