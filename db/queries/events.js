import db from "#db/client";

export const createEvent = async (name, startTime, endTime, location, organizerId) => {
  const sql = `
    INSERT INTO events (name, start_time, end_time, location, organizer_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const { rows: [newEvent] } = await db.query(sql, [name, startTime, endTime, location, organizerId]);
  return newEvent;
}

export const getEventById = async (id) => {
  const sql = `
    SELECT * FROM events
    WHERE id = $1;
  `;

  const { rows: [event] } = await db.query(sql, [id]);
  return event;
}

export const getEventsByOrganizer = async (organizerId) => {
  const sql = `
    SELECT * FROM event
    WHERE organizer_id = $1;
  `;

  const { rows: events } = await db.query(sql, [organizerId]);
  return events;
}

export const deleteEventById = async (id) => {
  const sql = `
    DELETE FROM events
    WHERE id = $1
    RETURNING *;
  `;

  const { rows: [deletedEvent] } = await db.query(sql, [id]);
  return deletedEvent;
}