import db from "#db/client";

export const createAlert = async (isOkay, name, message, eventId, recieverId, senderId) => {
  const sql = `
    INSERT INTO alerts(
      is_okay,
      name,
      message,
      event_id,
      recipient_id,
      sender_id
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6
    )
    RETURNING *;
  `;

  const { rows: [newAlert] } = await db.query(sql, [isOkay, name, message, eventId, recieverId, senderId]);
  return newAlert;
}

export const getAlertById = async (id) => {
  const sql = `
    SELECT * FROM alerts
    WHERE id = $1;
  `;

  const { rows: [alert] } = await db.query(sql, [id]);
  console.log(alert);
  return alert;
}

export const getAlertsByEvent = async (eventId) => {
  const sql = `
    SELECT * FROM alerts
    WHERE event_id = $1;
  `;

  const { rows: events } = await db.query(sql, [eventId]);
  return events;
}

export const getAlertsByReciever = async (recieverId) => {
  const sql = `
    SELECT * FROM alerts
    WHERE recipient_id = $1;
  `;

  const {rows: alerts} = await db.query(sql, [recieverId]);
  return events;
}

export const getAlertsBySender = async (senderId) => {
  const sql = `
    SELECT * FROM alerts
    WHERE sender_id = $1;
  `;

  const { rows: events } = await db.query(sql, [senderId]);
  return events;
}

export const deleteAlertById = async (id) => {
  const sql = `
    DELETE FROM alerts
    WHERE id = $1
    RETURNING *;
  `;

  const { rows: [deletedAlert] } = await db.query(sql, [id]);
  return deletedAlert;
}

export const updateAlertById = async (alertId, isOkay, name, message, eventId, recieverId, senderId) => {
   const sql = `
    UPDATE alerts
    SET 
      is_okay = $2,
      name = $3,
      message = $4,
      event_id = $5,
      recipient_id = $6,
      sender_id = $7
    WHERE id = $1
    RETURNING *
  `;
  const { rows: [updatedAlert] } = await db.query(sql, [alertId, isOkay, name, message, eventId, recieverId, senderId]);
  return updatedAlert;
}