export default function requireOrganizer(req, res, next) {
  const {id, account_type: accountType} = req.user;

  if(accountType !== "org") return res.status(403).send("Authorization denied. User not an organizer.");

  next();
}
