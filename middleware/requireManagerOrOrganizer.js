export default async function requireManagerOrOrganizer(req, res, next) {
  const { account_type: accountType } = req.user;
  //if role is not a manager
  if (accountType !== "man" && accountType !== "org") res.status(403).send("Authorization denied. User not a manager or organizer.");

  next();
}