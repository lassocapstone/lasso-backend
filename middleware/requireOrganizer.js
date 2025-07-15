export default function requireOrganizer(req, res, next) {
  if(req.user.account_type !== "org") res.status(403).send("Authorization denied. User not an organizer.");
  next();
}
