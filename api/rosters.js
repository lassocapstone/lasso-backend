import express from "express";
const rostersRouter = express.Router();
export default rostersRouter;
import {
  getManagersByEventId,
  getEventsByManagerId,
  createManagersEvents,
  deleteManagerEventByManagerId,
} from "#db/queries/managersEvents";
import {
  getSubordinatesByEventId,
  createSubordinatesEvents,
  deleteSubordinateEventBySubordinateId,
  getSubordinatesByManagerId,
  updateSubordinateManagerByManagerId,
} from "#db/queries/subordinatesEvents";
import requireUser from "#middleware/requireUser";
import { getEventById } from "#db/queries/events";
import { getEventsByOrganizer } from "#db/queries/events";
import requireOrganizer from "#middleware/requireOrganizer";
import requireAdmin from "#middleware/requireAdmin";
import requireBody from "#middleware/requireBody";

rostersRouter.use(requireUser);

rostersRouter.get("/", async (req, res, next) => {
  const { id: userId, account_type: accountType } = req.user;
  const { eventId } = req.query;
  if (!eventId) {
    return res.status(400).send("Missing Event Id");
  }
  const event = await getEventById(eventId);
  if (!event) {
    return res.status(404).send("Event Not Found");
  }

  if (accountType === "org") {
    const organizedEvents = await getEventsByOrganizer(userId);
    const isOrganizerForThisEvent = organizedEvents.some(
      (e) => e.id === parseInt(eventId)
    );
    if (!isOrganizerForThisEvent) {
      return res.status(403).send("You are not part of this event");
    }
  }

  if (accountType === "man") {
    const managedEvents = await getEventsByManagerId(userId);
    const isManagerForThisEvent = managedEvents.some(
      (e) => e.id === parseInt(eventId)
    );
    if (!isManagerForThisEvent) {
      return res.status(403).send("You are not part of this event");
    }
  }

  let roster;
  switch (accountType) {
    case "org":
      roster = [
        await getManagersByEventId(eventId),
        await getSubordinatesByEventId(eventId),
      ];
      break;
    case "man":
      roster = await getSubordinatesByManagerId(eventId);
      break;
    case "sub":
      roster = res.status(403).send("You do not have access to the roster");
      break;
  }
  return res.send(roster);
});

rostersRouter.use(requireAdmin);

rostersRouter.post(
  "/",
  requireBody(["eventId", "userId", "managerId"]),
  requireOrganizer,
  async (req, res) => {
    const { eventId, userId, managerId } = req.body;
    const requesterId = req.user.id;
    const user = await getUserById(userId);

    if (!Number.isInteger(eventId) || !Number.isInteger(userId)) {
      return res.status(400).send("Malformed Request");
    }
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).send("Event not found");
    }
    if (event.organizer_id !== requesterId) {
      return res.status(403).send("Only the event organizer can add users");
    }

    if (user.account_type === "man") {
      await createManagersEvents(userId, eventId);
      return res.status(201).send("Manager Added");
    }

    if (user.account_type === "sub") {
      if (!Number.isInteger(managerId)) {
        return res.status(400).send("Missing or invalid manager Id");
      }
      await createSubordinatesEvents(userId, eventId, managerId);
      return res.status(201).send("Subordinate Added");
    }
  }
);

rostersRouter.delete(
  "/",
  requireBody(["userId"]),
  requireOrganizer,
  async (req, res, next) => {
    const { userId } = req.body;

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.account_type === "man") {
      const subordinates = await getSubordinatesByManagerId(userId);
      if (subordinates.length > 0) {
        return res
          .status(400)
          .send("Cannot remove manager with assigned subordinates");
      }
      const deleted = await deleteManagerEventByManagerId(userId);
      if (!deleted) {
        return res.status(404).send("Manager not part of this event");
      }
      return res.status(204).send("User removed");
    }

    if (user.account_type === "sub") {
      const deleted = await deleteSubordinateEventBySubordinateId(userId);
      if (!deleted) {
        return res.status(404).send("Subordinate is not part of this event");
      }
      return res.status(204).send("User removed");
    }
  }
);

rostersRouter.get("/:manager", async (req, res) => {
  const managerId = parseInt(req.params.manager);
  if (isNaN(managerId)) {
    return res.status(404).send("Manager not found");
  }
  const managerRoster = await getSubordinatesByManagerId(managerId);
  return res.status(200).send(managerRoster);
});

rostersRouter.put("/:manager", async (req, res) => {
  const { newManagerId, oldManagerId, eventId } = req.body;
  const requesterId = req.user.id;
  const event = await getEventById(eventId);
  if (!event) {
    return res.status(404).send("Event not found");
  }
  if (event.organizer_id !== requesterId) {
    return res.status(403).send("You are not the organizer for this event");
  }
  await updateSubordinateManagerByManagerId(newManagerId, oldManagerId);
  return res.status(200).send("Updated");
});
