import express from "express";
const rostersRouter = express.Router();
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
} from "#db/queries/subordinatesEvents";
import requireUser from "#db/middleware/requireUser";
import { getEventById } from "#db/queries/events";
import { getEventsByOrganizer } from "#db/queries/events";
import requireOrganizer from "#middleware/requireOrganizer";

rostersRouter.use(requireUser);

rostersRouter.get("/", async (req, res, next) => {
  const { id: userId, account_type: accountType } = req.user;
  const { eventId } = req.query;
  if (!eventID) {
    return res.status(400).send("Missing Event Id");
  }
  const event = getEventById(eventId);
  if (!event) {
    return res.status(404).send("Event Not Found");
  }

  if (accountType === "org") {
    const isOrganizer = getEventsByOrganizer(userId);
    if (!isOrganizer) {
      return res.status(403).send("You are not part of this event");
    }
  }

  if (accountType === "man") {
    const isManager = getEventsByManagerId(userId);
    if (!isManager) {
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
      roster = await getSubordinatesByEventId(eventId);
      break;
    case "sub":
      roster = res.status(403).send("You do not have access to the roster");
      break;
  }
});

rostersRouter.use(requireOrganizer);

rostersRouter.post("/", async (req, res) => {
  const { eventId, userId, managerId } = req.body;
  const requesterId = req.user.id;
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
});

rostersRouter.delete("/", async (req, res, next) => {
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
      return res
        .status(404)
        .json({ error: "Subordinate not part of this event" });
    }
    return res.status(204).send("User removed");
  }
});
