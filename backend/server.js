import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import PublicApiRoutes from "./Routes/PublicAPI.route.js";
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter.js";
import { requireVipCode } from "./middlewares/auth.js";
// import spotifyAuth from "./Routes/SpotifyAuth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const VIP_CODE = process.env.VIP_CODE;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable.");
}

if (!VIP_CODE) {
  throw new Error("Missing VIP_CODE environment variable.");
}

const timingSafeCompare = (a, b) => {
  const aBuffer = Buffer.from(a ?? "", "utf8");
  const bBuffer = Buffer.from(b ?? "", "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
}));

app.use(cookieParser());
app.use(express.json());

app.post("/api/verify-vip", authLimiter, (req, res) => {
  const { code } = req.body;

  if (typeof code !== "string" || !timingSafeCompare(code.trim(), VIP_CODE)) {
    return res.status(401).json({ error: "Invalid Code" });
  }

  const token = jwt.sign({ role: "vip" }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("vip_token", token, {
    httpOnly: true, 
    secure: true, 
    sameSite: "none", 
    maxAge: 3600000 
  });

  res.json({ success: true, message: "Welcome to the VIP Club" });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("vip_token");
  res.json({ message: "Logged out" });
});

app.use("/api", requireVipCode); 
app.use("/api", apiLimiter); 
app.use("/api", PublicApiRoutes);
// app.use("/auth", spotifyAuth);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
