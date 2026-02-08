import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import PublicApiRoutes from "./Routes/PublicAPI.route.js";
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter.js";
import { requireVipCode } from "./middlewares/auth.js";
// import spotifyAuth from "./Routes/SpotifyAuth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
}));

app.use(cookieParser());
app.use(express.json());

app.post("/api/verify-vip", (req, res) => {
  const { code } = req.body;
  if (code !== process.env.VIP_CODE) {
    return res.status(401).json({ error: "Invalid Code" });
  }
  const token = jwt.sign({ role: "vip" }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1h" });

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

app.use("/api", authLimiter); 
app.use("/api", requireVipCode); 
app.use("/api", apiLimiter); 
app.use("/api", PublicApiRoutes);
// app.use("/auth", spotifyAuth);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
