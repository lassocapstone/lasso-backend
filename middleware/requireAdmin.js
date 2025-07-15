export default function requireAdmin(req, res, next) {
  console.log(req.user);
  if(req.user.account_type !== "org" && req.user.account_type !== "man") res.status(403).send("Authorization denied. User not an admin.");
  next();
}
