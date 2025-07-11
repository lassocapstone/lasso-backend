//check if the user is an Organizer
export default function requireOrganizer(req, res, next){
  const { account_type: accountType } = req.user;
  if(accountType !== "org") res.status(403).send("Authorization denied. User not an organizer.");
  next();
}