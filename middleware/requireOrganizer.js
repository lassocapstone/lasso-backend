export default requireOrganizer = (req, res, next) => {
  if(req.user.accountType !== "org") res.status(403).send("Authorization denied. User not an organizer.");
  next();
}