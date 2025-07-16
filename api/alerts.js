import express from "express";
const router = express.Router();
export default router;

import { createAlert, deleteAlertById, getAlertById, getAlertsByEvent, getAlertsBySender, updateAlertById } from "#db/queries/alerts";
import requireAdmin from "#middleware/requireAdmin";
import requireBody from "#middleware/requireBody";

//check if the alert exists; end the code if it doesn't
//attach the gotten alert if it does
import requireAlert from "#middleware/requireAlert";

router.use(requireAdmin);

router.route("/")
  .get(
    async (req, res) => {
      const eventAlerts = await getAlertsByEvent(req.event.id);

      const userAlerts = eventAlerts.filter((curAlert) =>
        curAlert.recipient_id === Number(req.user.id) || curAlert.sender_id === Number(req.user.id)
      );

      res.send(userAlerts);
})
  .post(
    requireBody(["isOkay", "name", "message", "eventId", "recipientId"]),
    async (req, res) => {
      const { isOkay, name, message, eventId, recipientId } = req.body;
      const createdAlert = await createAlert(isOkay, name, message, eventId, recipientId, req.user.id);
      res.status(201).send(createdAlert);
});

router.route("/:alertId")
  .get(
    requireAlert,
    async (req, res) => {
      const {alertId} = req.params;
      const alert = await getAlertById(alertId);
      res.send(alert);
})
  .put(
    requireAlert,
    requireBody(["isOkay", "name", "message", "eventId", "recipientId", "senderId"]),
    async (req, res) => {
      const {isOkay, name, message, eventId, recipientId, senderId} = req.body;
      const {alertId} = req.params;

      const updatedAlert = await updateAlertById(alertId, isOkay, name, message, eventId, recipientId, senderId);
      res.send(updatedAlert);
  })
  .delete(
    requireAlert, 
    async (req, res) => {
      const {alertId} = req.params;
      const deletedAlert = await deleteAlertById(alertId);
      res.status(204).send("Alert deleted");
});