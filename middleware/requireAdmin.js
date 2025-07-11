export default function requireAdmin(req, res, next){
  const {account_type: accountType} = req.user;
  
  if(accountType !== "man" || accountType !== "org") res.status(403).send("Authorization denied. User not an admit.");
  next();
}