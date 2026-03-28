import { Router } from "express";
import {transferMoney, depositMoney } from "../controller/transaction.controller.js";

const router=Router()


router.post('/transfer',transferMoney)
router.post('/money',depositMoney)
export default router