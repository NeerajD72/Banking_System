import { Router } from "express";
import { createAccount,account_list,single_account,accountBalance} from "../controller/account.controller.js";
const router=Router()

router.post('/create',createAccount)
router.get('/accounts',account_list)
router.get('/:id',single_account)
router.get('/balance/:id',accountBalance)


export default router