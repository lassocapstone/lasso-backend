export default requireManager = async (req, res, next) => {
  const { accountType } = req.user;

  //if role is not a manager
  if(accountType !== "man") res.status(403).send("Authorization denied. User not a manager.");

  next();
}