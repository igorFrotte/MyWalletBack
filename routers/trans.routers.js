import express from "express";
import * as transController from "../controllers/trans.controller.js";
import authorizationMiddleware from "../middlewares/authorization.middleware.js";

const router = express.Router();

router.use(authorizationMiddleware);

router.get("/token", transController.token);
router.post("/transactions", transController.create);
router.get("/transactions", transController.list);

export default router;