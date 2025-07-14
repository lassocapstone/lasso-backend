import { createAlert, deleteAlertById, getAlertById, getAlertsByEvent, getAlertsBySender, updateAlert } from "#db/queries/alerts";
import requireManagerOrOrganizer from "#middleware/requireManagerOrOrganizer";
import requireBody from "#middleware/requireBody";
import express from "express";
const alertsRouter = express.Router();

alertsRouter.use(requireManagerOrOrganizer);
//or organizer

alertsRouter.get('/', async (req, res) => {
  const alertsByUser = await getAlertsBySender(req.user.id);
  if (!alertsByUser) return res.status(404).send('Alert Not Found');
  res.send(alertsByUser);
});

alertsRouter.post('/', requireBody(["is_okay", "name", "message", "event_id"]), async (req, res) => {
  const { is_okay, name, message, event_id } = req.body;
  const createdAlert = await createAlert(is_okay, name, message, event_id, req.user.id);
  res.status(201).send(createdAlert);
});

alertsRouter.get('/:id', async (req, res) => {
  const alert = await getAlertById(req.params.id);
  if (!alert) return res.status(404).send('Alert Not Found');
  if (req.user.id !== alert.sender_id) return res.status(403).send('Forbidden: Not Your Alert');
  res.send(alert);
});

alertsRouter.patch('/:id', async (req, res) => {
  const alert = await getAlertById(req.params.id);
  if (!alert) return res.status(404).send('Alert Not Found');
  if (req.user.id !== alert.sender_id) return res.status(403).send('Forbidden: Not Your Alert');
  const updates = req.body;
  updates.id = req.params.id;
  const newPatch = await updateAlert(updates);
  res.send(newPatch);
});

alertsRouter.delete('/:id', async (req, res) => {
  const alert = await getAlertById(req.params.id);
  if (!alert) res.status(404).send('Alert Not Found');
  if (req.user.id !== alert.sender_id) return res.status(403).send('Forbidden: Not Your Alert');
  const deletedAlert = await deleteAlertById(req.params.id);
  res.status(204).send(deletedAlert);
});

export default alertsRouter;