import { getAlertById } from "#db/queries/alerts";

export default async function requireAlert(req, res, next) {
  const {alertId} = req.params;

  const alert = await getAlertById(alertId);
  if(!alert) return res.status(404).send("That alert does not exist");
  
  if (req.user.id !== alert.sender_id) return res.status(403).send('Forbidden: Not Your Alert');

  next();
}