import express from "express";
import * as transController from "../controllers/trans.controller.js";
import authorizationMiddleware from "../middlewares/authorization.middleware.js";

const router = express.Router();

router.use(authorizationMiddleware);

router.post("/transactions", transController.create);
router.get("/transactions", transController.list);

export default router;