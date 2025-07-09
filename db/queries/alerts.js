import db from "#db/client";

export const createAlert = async (isOkay, name, message, eventId, senderId) => {
  const sql = `
    INSERT INTO alerts(
      is_okay,
      name,
      message,
      event_id,
      sender_id
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5
    )
    RETURNING *;
  `;

  const {rows: [newAlert]} = await db.query(sql, [isOkay, name, message, eventId, senderId]);
  return newAlert;
}

export const getAlertById = async (id) => {
  const sql = `
    SELECT * FROM alerts
    WHERE id = $1;
  `;

  const {rows: [alert]} = await db.query(sql, [id]);
  return alert;
}

export const getAlertsByEvent = async (eventId) => {
  const sql = `
    SELECT * FROM alerts
    WHERE event_id = $1;
  `;

  const {rows: events} = await db.query(sql, [eventId]);
  return events;
}

export const getAlertsBySender = async (senderId) => {
  const sql = `
    SELECT * FROM alerts
    WHERE sender_id = $1;
  `;

  const {rows: events} = await db.query(sql, [senderId]);
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