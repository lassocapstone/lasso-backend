export default requireManager = (req, res, next) => {
  if(req.user.accountType !== "man") res.status(403).send("Authorization denied. User not a manager.");
  next();
}