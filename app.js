import express  from "express"
import cookieParser from "cookie-parser"
import authRoutes from './routes/auth.routes.js'
import accountroutes from './routes/account.routes.js'
import requireAuth from './middleware/auth.middleware.js'
import transactionRoutes from './routes/transaction.routes.js'
import requireRole from './middleware/role.middleware.js'
const app=express()

app.use(express.json())
app.use(cookieParser())


app.use('/api/auth',authRoutes)
app.use('/api/account',requireAuth,accountroutes)
app.use('/api/transaction',requireAuth,transactionRoutes)
app.use('/api/deposite',requireAuth,requireRole,transactionRoutes)
export default app