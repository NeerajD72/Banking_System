import { Router } from "express";
import { register,emailverifypart,login,vrifyOtp,refreshtoken,logout } from "../controller/auth.controller.js";
import requireAuth from '../middleware/auth.middleware.js'

const router=Router()


router.post('/register',register)
router.get('/email-verify',emailverifypart)
router.post('/login',login)
router.post('/verifyOtp',vrifyOtp)
router.post('/refreshToken',refreshtoken)
router.post('/logout',requireAuth,logout)

export default router