import requireUser from "#middleware/requireUser";
import { getEventById } from "#db/queries/events";
import db from "#db/client";
import { express } from "express";
const rostersRouter = express.Router();
export default rostersRouter;

rostersRouter.use(requireUser);

router.get("/", async (req, res, next) => {
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
