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
      const alertsByUser = await getAlertsBySender(req.user.id);
      res.send(alertsByUser);
})
  .post(
    requireBody(["isOkay", "name", "message", "eventId"]),
    async (req, res) => {
      const { isOkay, name, message, eventId } = req.body;
      const createdAlert = await createAlert(isOkay, name, message, eventId, req.user.id);
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
    requireBody(["isOkay", "name", "message", "eventId", "senderId"]),
    async (req, res) => {
      const {isOkay, name, message, eventId, senderId} = req.body;
      const {alertId} = req.params;

      const updatedAlert = await updateAlertById(alertId, isOkay, name, message, eventId, senderId);
      res.send(updatedAlert);
  })
  .delete(
    requireAlert, 
    async (req, res) => {
      const {alertId} = req.params;
      const deletedAlert = await deleteAlertById(alertId);
      res.status(204).send(deletedAlert);
});