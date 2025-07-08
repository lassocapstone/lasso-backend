export default requireManager = async (err, req, res, next) => {
  const { role } = req.user;

  //if role is not a manager
  if(role !== "man") res.status(403).send("Authorization denied. User not a manager.");

  next();
}