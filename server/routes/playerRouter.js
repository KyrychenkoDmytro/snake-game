import { Router } from "express";
import playerController from "../controllers/playerController.js";

const router = new Router();

router.get('/', playerController.getTopPlayers);
router.post('/', playerController.authorization);

export default router;