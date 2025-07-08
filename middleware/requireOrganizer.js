export default requireOrganizer = async (err, req, res, next) => {
  const { role } = req.user;

  //if role is not an organizer
  if(role !== "org") res.status(403).send("Authorization denied. User not an organizer.");

  next();
}