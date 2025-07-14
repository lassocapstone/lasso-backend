import express from "express";
const tasksRouter = express.Router();
export default tasksRouter;
import db from "#db/client";
import { getTaskById } from "#db/queries/tasks";
import { deleteTaskById } from "#db/queries/tasks";
import requireUser from "#middleware/requireUser";
import { getEventById } from "#db/queries/events";

tasksRouter.get("/", async (req, res, next) => {
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

tasksRouter.post("/", async (req, res, next) => {
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

tasksRouter.get("/:id", async (req, res, next) => {
  const taskId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const task = await getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { rows: access } = await db.query(
      `
      SELECT 1 FROM events
      WHERE id = $1 AND (
        organizer_id = $2
        OR $2 IN (SELECT manager_id FROM managers_events WHERE event_id = $1)
        OR $2 IN (SELECT subordinate_id FROM subordinates_events WHERE event_id = $1)
      )
    `,
      [task.event_id, userId]
    );

    if (access.length === 0) {
      return res.status(403).json({ error: "Not authorized for this event" });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch("/:id", async (req, res, next) => {
  const taskId = Number(req.params.id);
  const userId = req.user.id;
  const { name, location, startTime, endTime, eventId, instructions } =
    req.body;

  // Basic validation (optional: move to a separate validator)
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
    const task = await getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { rows: access } = await db.query(
      `
      SELECT 1 FROM events
      WHERE id = $1 AND (
        organizer_id = $2
        OR $2 IN (SELECT manager_id FROM managers_events WHERE event_id = $1)
        OR $2 IN (SELECT subordinate_id FROM subordinates_events WHERE event_id = $1)
      )
    `,
      [task.event_id, userId]
    );

    if (access.length === 0) {
      return res.status(403).json({ error: "Not authorized for this event" });
    }

    const {
      rows: [updatedTask],
    } = await db.query(
      `
      UPDATE tasks
      SET name = $1,
          location = $2,
          start_time = $3,
          end_time = $4,
          event_id = $5,
          instructions = $6
      WHERE id = $7
      RETURNING *;
    `,
      [name, location, startTime, endTime, eventId, instructions, taskId]
    );

    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete("/:id", async (req, res, next) => {
  const taskId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const task = await getTaskById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const event = await getEventById(task.event_id);
    if (!event)
      return res.status(404).json({ error: "Associated event not found" });

    if (event.organizer_id !== userId) {
      return res
        .status(403)
        .json({ error: "Only the organizer can delete this task" });
    }

    await deleteTaskById(taskId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});
