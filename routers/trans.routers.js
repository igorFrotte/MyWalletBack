import express from "express";
import * as transController from "../controllers/trans.controller.js"

const router = express.Router();

//fazer middlers

router.post("/transactions", transController.create);
router.get("/transactions", transController.list);

export default router;