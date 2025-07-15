import requireUser from "#middleware/requireUser";
import { getEventById } from "#db/queries/events";
import db from "#db/client";
import express from "express";
const rostersRouter = express.Router();
export default rostersRouter;

rostersRouter.use(requireUser);

rostersRouter.get("/", async (req, res, next) => {
  const { eventId } = req.query;
  const userId = req.user.id;
  const accountType = req.user.account_type;

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const { rows: access } = await db.query(
      `
      SELECT 1 FROM events
      WHERE id = $1 AND (
        organizer_id = $2
        OR $2 IN (SELECT manager_id FROM managers_events WHERE event_id = $1)
        OR $2 IN (SELECT subordinate_id FROM subordinates_events WHERE event_id = $1)
      )
    `,
      [eventId, userId]
    );

    if (access.length === 0) {
      return res.status(403).json({ error: "You are not part of this event" });
    }

    if (accountType === "ORG") {
      const { rows: users } = await db.query(
        `
        SELECT u.*
        FROM users u
        WHERE u.id = $1
          OR u.id IN (SELECT manager_id FROM managers_events WHERE event_id = $2)
          OR u.id IN (SELECT subordinate_id FROM subordinates_events WHERE event_id = $2)
      `,
        [event.organizer_id, eventId]
      );
      return res.json(users);
    }

    if (accountType === "MAN") {
      const { rows: users } = await db.query(
        `
        SELECT u.name
        FROM users u
        WHERE u.id = $1
          OR u.id IN (SELECT manager_id FROM managers_events WHERE event_id = $2)
          OR u.id IN (SELECT subordinate_id FROM subordinates_events WHERE event_id = $2)
      `,
        [event.organizer_id, eventId]
      );
      return res.json(users);
    }

    return res
      .status(403)
      .json({ error: "Insufficient permissions to view roster" });
  } catch (err) {
    next(err);
  }
});

rostersRouter.post("/", async (req, res, next) => {
  const { eventId, userId, managerId } = req.body;
  const requesterId = req.user.id;

  if (
    !eventId ||
    !userId ||
    typeof eventId !== "number" ||
    typeof userId !== "number"
  ) {
    return res.status(400).json({
      error:
        "Malformed body: eventId and userId are required and must be integers",
    });
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer_id !== requesterId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can modify the roster" });
    }

    const {
      rows: [userToAdd],
    } = await db.query(
      `
      SELECT id, account_type FROM users WHERE id = $1
    `,
      [userId]
    );

    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToAdd.account_type === "ORG") {
      return res
        .status(400)
        .json({ error: "Cannot add another organizer to an event" });
    }

    if (userToAdd.account_type === "MAN") {
      const {
        rows: [added],
      } = await db.query(
        `
        INSERT INTO managers_events (manager_id, event_id)
        VALUES ($1, $2)
        RETURNING *;
      `,
        [userId, eventId]
      );

      return res
        .status(201)
        .json({ message: "Manager added to event", data: added });
    }

    if (userToAdd.account_type === "SUB") {
      if (!managerId || typeof managerId !== "number") {
        return res
          .status(400)
          .json({ error: "Missing or invalid managerId for subordinate" });
      }

      const {
        rows: [added],
      } = await db.query(
        `
        INSERT INTO subordinates_events (subordinate_id, event_id, manager_id)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
        [userId, eventId, managerId]
      );

      return res
        .status(201)
        .json({ message: "Subordinate added to event", data: added });
    }

    return res.status(400).json({ error: "Unrecognized account type" });
  } catch (err) {
    next(err);
  }
});

rostersRouter.delete("/", async (req, res, next) => {
  const { eventId, userId } = req.body;
  const requesterId = req.user.id;

  if (!eventId || !userId) {
    return res.status(400).json({ error: "Missing eventId or userId" });
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer_id !== requesterId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can remove users" });
    }

    const {
      rows: [user],
    } = await db.query(`SELECT account_type FROM users WHERE id = $1`, [
      userId,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.account_type === "MAN") {
      const { rows: subordinates } = await db.query(
        `
        SELECT id FROM subordinates_events
        WHERE manager_id = $1 AND event_id = $2
      `,
        [userId, eventId]
      );

      if (subordinates.length > 0) {
        return res.status(400).json({
          error: "Cannot remove manager with assigned subordinates",
        });
      }

      const {
        rows: [removed],
      } = await db.query(
        `
        DELETE FROM managers_events
        WHERE manager_id = $1 AND event_id = $2
        RETURNING *;
      `,
        [userId, eventId]
      );

      if (!removed) {
        return res
          .status(404)
          .json({ error: "Manager not part of this event" });
      }

      return res.sendStatus(204);
    }

    if (user.account_type === "SUB") {
      const {
        rows: [removed],
      } = await db.query(
        `
        DELETE FROM subordinates_events
        WHERE subordinate_id = $1 AND event_id = $2
        RETURNING *;
      `,
        [userId, eventId]
      );

      if (!removed) {
        return res
          .status(404)
          .json({ error: "Subordinate not part of this event" });
      }

      return res.sendStatus(204);
    }

    return res.status(400).json({ error: "Cannot remove organizers this way" });
  } catch (err) {
    next(err);
  }
});
