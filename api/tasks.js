import express from "express";
const tasksRouter = express.Router();
export default tasksRouter;
import db from "#db/client";

router.get("/", async (req, res, next) => {
  const { eventId } = req.query;
  const userId = req.user.id;

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

    const tasks = await getTasksByEvent(eventId);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { name, location, startTime, endTime, eventId, instructions } =
    req.body;
  const userId = req.user.id;

  if (
    !name ||
    !location ||
    !startTime ||
    !endTime ||
    !eventId ||
    typeof name !== "string" ||
    typeof location !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    typeof eventId !== "number" ||
    (instructions && typeof instructions !== "string")
  ) {
    return res.status(400).json({ error: "Malformed request body" });
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can create tasks" });
    }

    const newTask = await createTask(
      eventId,
      name,
      startTime,
      endTime,
      location,
      instructions
    );
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});
