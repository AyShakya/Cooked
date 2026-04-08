import jwt from "jsonwebtoken";

export const requireVipCode = (req, res, next) => {
  const token = req.cookies.vip_token;
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    return res.status(401).json({ error: "No Access Token found" });
  }

  if (!jwtSecret) {
    return res.status(500).json({ error: "Auth is not configured" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || decoded.role !== "vip") {
      return res.status(403).json({ error: "Insufficient access rights" });
    }

    next(); 
  } catch (err) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};
