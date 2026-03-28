import User from "../model/user.model.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { errorResponse, successResponse } from "../lib/response.js";
import { passwordHash, comparePassword } from "../lib/hash.js";
import { sendMail } from "../lib/email.js";
import { AccessToken, RefreshToken, verifyAccessToken, verifyRefreshToken } from "../lib/tokens.js";
import TokenBlacklist from "../model/blacklist.model.js";
import { generateOtp, hashOtp, verifyOtp } from "../lib/otp.js";
import logger from "../config/logger.js";
import { sendSMS } from "../lib/sms.js";

export const register = asyncHandler(async (req, resp) => {
  const { name, email, phone, password } = req.body;
  if (!email || !name || !password || !phone) {
    return errorResponse(resp, "all fields are required", 400);
  }
  if (password.length < 8) {
    return errorResponse(resp, "Password must be at least 8 characters", 400);
  }
  const normalizedEmail = email.toLowerCase().trim();
  const isExist = await User.findOne({ $or: [ { email: normalizedEmail }, { phone: phone } ] });
  if (isExist) {
    return errorResponse(
      resp,
      "you are allready registerd, please try to login",
      409,
    );
  }

  const Hashpassword = await passwordHash(password);

  const createNewUser = await User.create({
    name,
    email: normalizedEmail,
    phone,
    password: Hashpassword,
  });
  logger.info("New user registered", { email: normalizedEmail });

  const token = await AccessToken(createNewUser.id)
  const verifyurl = `http://localhost:5000/api/auth/email-verify?token=${token}`;

  await sendMail({
    to: createNewUser.email,
    subject: `to verify your email`,
    html: `<p>plaese click here to verify your email <a href="${verifyurl}">${verifyurl}</a></p>`,
  });

  return successResponse(
    resp,
    { name, email: normalizedEmail, phone ,token:token},
    "registeration success,ceck email to verify",
    200,
  );
});

export const emailverifypart = asyncHandler(async (req, resp) => {
  const { token } = req.query;
  if (!token) {
    return errorResponse(resp, "token is required", 400);
  }
  let decoded;
  try {
    decoded = await verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(resp, "Verification link expired", 400);
    }
    return errorResponse(resp, "Invalid token", 400);
  }
  const user = await User.findById(decoded.userId);
  if (!user) {
    return errorResponse(resp, "user not found", 409);
  }

  if (user.isEmailVerified) {
    return errorResponse(resp, "Email already verified", 400);
  }
  user.isEmailVerified = true;
  await user.save();
  logger.info("Email verified", { userId: decoded.userId });
  return successResponse(
    resp,
    {},
    "your email is verifyied now, you can login",
    200,
  );
});

export const login = asyncHandler(async (req, resp) => {
  const { email,phone, password } = req.body;
  if (!email || !password ||!phone) {
    return errorResponse(resp, "email,phone and password are required to login", 400);
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );
  if (!user) {
    return errorResponse(resp, "user not found", 401);
  }
  const chekPassword = await comparePassword(password, user.password);
  if (!chekPassword) {
    return errorResponse(resp, "Email and Password is wrong", 401);
  }
  if (!user.isEmailVerified) {
    return errorResponse(resp, "please verify your email first");
  }

  const otp = generateOtp();
  const Otphash = hashOtp(otp);
  user.otpHash = Otphash;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendSMS({
    to: user.phone,
    subject: `Your Login OTP is ${otp}`,
  });

  return successResponse(resp, {otp:otp}, "OTP sent to your phone", 200);
});

export const vrifyOtp = asyncHandler(async (req, resp) => {
  const { otp, email,phone } = req.body;
  if (!otp || !email || !phone) {
    return errorResponse(resp, "otp,phone and email is required", 400);
  }
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+otpHash +otpExpiry",
  );
  if (!user) {
    return errorResponse(resp, "user not found", 400);
  }
  if (new Date() > user.otpExpiry) {
    return errorResponse(resp, "token expired", 400);
  }
  const verifyotp = verifyOtp(otp, user.otpHash);
  if (!verifyotp) {
    return errorResponse(resp, "Invalid OTP", 401);
  }
  logger.info("otp verified");
  user.otpHash = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const accessToken = await AccessToken(user._id);
  const refreshToken = await RefreshToken(user._id);

  const isprod = process.env.NODE_ENV === "production";
  resp.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: isprod,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  logger.info("User logged in successfully", {
    userId: user._id,
    email: user.email,
  });
  return successResponse(
    resp,
    {
      accessToken: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    },
    "user login success",
    200,
  );
});

export const refreshtoken = asyncHandler(async (req, resp) => {
  const token = req.cookies?.refreshtoken;
  
  if (!token ) {
    return errorResponse(
      resp,
      "token is missing at the time for refreshing the token",
      400,
    );
  }

  let verifyToken;
  try {
    verifyToken =await verifyRefreshToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(resp, "Session expired please login again", 401);
    }
    return errorResponse(resp, "Invalid token", 401);
  }
  const findrefreshBlocklisttoken=await TokenBlacklist.findOne({ token })
  if (findrefreshBlocklisttoken ) {
    return errorResponse(
      resp,
      "token is missing at the time for refreshing the token",
      400,
    );
  }
  const user = await User.findById(verifyToken.userId);
  if (!user) {
    return errorResponse(resp, "user not found", 401);
  }

  await TokenBlacklist.create({ token })
  const newAccessToken =await AccessToken(user.id);
  const newRefreshToken =await RefreshToken(user.id);

  const isprod = process.env.NODE_ENV === "production";
  resp.cookie("refreshtoken", newRefreshToken, {
    httpOnly: true,
    secure: isprod,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return successResponse(resp,{
      newAccessToken:newAccessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    }, "refresh token generated",
    200,
  );
});

export const logout = asyncHandler(async (req, resp) => {
  const token = req.cookies.refreshtoken || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return errorResponse(
      resp,
      "token is missing at the time of blocking the token",
      401,
    );
  }
  await TokenBlacklist.create({
    token: token,
  });
  resp.clearCookie("refreshtoken", { path: "/" });
  logger.info('User logged out', { token: token.substring(0, 20) })
  return successResponse(resp,{}, "user logout success", 200);
});
