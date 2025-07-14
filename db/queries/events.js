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
    SELECT * FROM events
    WHERE organizer_id = $1;
  `;

  const { rows: events } = await db.query(sql, [organizerId]);
  return events;
}

export const updateEventById = async (eventId, name, startTime, endTime, location, organizerId) => {
  const sql = `
    UPDATE events
      SET 
        name = $1,
        start_time = $2,
        end_time = $3,
        location = $4,
        organizer_id = $5
      WHERE events.id = $6
    RETURNING *;
  `;

  const { rows: updatedEvent } = await db.query(sql, [name, startTime, endTime, location, organizerId, eventId]);
  return updatedEvent;
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