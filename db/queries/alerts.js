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

  const { rows: [newAlert] } = await db.query(sql, [isOkay, name, message, eventId, senderId]);
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

//for patch request
export const updateAlert = async (data) => {
  // destructure id and rest of fields from data object
  const { id, ...fieldstoUpdate } = data;
  // getting keys from actual fields to update
  const keys = Object.keys(fieldstoUpdate);
  if (keys.length === 0) return 'nothing to update';
  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  const setValues = [id, ...keys.map((key) => fieldstoUpdate[key])];
  const sql = `
    UPDATE alerts
    SET ${setClause}
    WHERE id=$1
    RETURNING *
  `;
  const { rows: [updatedAlert] } = await db.query(sql, setValues);
  return updatedAlert;
}