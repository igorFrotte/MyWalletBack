import express from "express";
import * as signController from "../controllers/sign.controllers.js"

const router = express.Router();

router.post("/sign-up", signController.signUP);
router.post("/sign-in", signController.signIn);

export default router;