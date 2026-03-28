# P-Banking-System

A banking system backend built with Node.js, Express and MongoDB.

## Features
- User authentication with 2FA OTP
- JWT access and refresh tokens
- Bank account management
- Atomic money transfers
- Double entry bookkeeping ledger
- Fraud detection
- Email and SMS notifications

## Tech Stack
Node.js, Express, MongoDB, Mongoose,
JWT, bcrypt, SendGrid, Twilio, Razorpay

## Setup
1. Clone the repository
2. Copy .env.example to .env
3. Fill in your environment variables
4. npm install
5. npm run dev

## API Endpoints
POST /api/auth/register
GET  /api/auth/email-verify
POST /api/auth/login
POST /api/auth/verifyOtp
POST /api/auth/refreshToken
POST /api/auth/logout

POST /api/accounts/create
GET  /api/accounts/accounts
GET  /api/accounts/:id
GET  /api/accounts/balance/:id

POST /api/transactions/transfer
POST /api/deposite/money

## One Important Thing
i return token and otp in response because of testing purpose .
