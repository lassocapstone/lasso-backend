export default requireOrganizer = async (req, res, next) => {
  const { accountType } = req.user;

  //if role is not an organizer
  if(accountType !== "org") res.status(403).send("Authorization denied. User not an organizer.");

  next();
}