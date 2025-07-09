import db from "#db/client";

export const createEvent = async (organizerId) => {
  const sql = `
    INSERT INTO events (organizer_id)
    VALUES ($1)
    RETURNING *;
  `;

  const {rows: [newEvent]} = await db.query(sql, [organizerId]);
  return newEvent;
}

export const getEventById = async (id) => {
  const sql = `
    SELECT * FROM events
    WHERE id = $1;
  `;

  const {rows: [event]} = await db.query(sql, [id]);
  return event;
}

export const getEventsByOrganizer = async (organizerId) => {
  const sql = `
    SELECT * FROM event
    WHERE organizer_id = $1;
  `;

  const {rows: events} = await db.query(sql, [organizerId]);
  return events;
}

export const deleteEventById = async (id) => {
  const sql = `
    DELETE FROM events
    WHERE id = $1
    RETURNING *;
  `;

  const {rows: [deletedEvent]} = await db.query(sql, [id]);
  return deletedEvent;
}