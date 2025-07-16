export default function requireAdmin(req, res, next) {
  if(req.user.account_type !== "org" && req.user.account_type !== "man") return res.status(403).send("Authorization denied. User not an admin.");
  next();
}
