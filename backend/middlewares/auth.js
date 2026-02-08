import jwt from "jsonwebtoken";

export const requireVipCode = (req, res, next) => {
  const token = req.cookies.vip_token;

  if (!token) {
    return res.status(401).json({ error: "No Access Token found" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    next(); 
  } catch (err) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};