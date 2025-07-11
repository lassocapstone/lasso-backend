import db from "#db/client";

//allow for a connection between 'manager users' and events
export const createManagersEvents = async (managerId, eventId) => {
  const sql = `
    INSERT INTO managers_events (
      manager_id,
      event_id
    )
    VALUES (
      $1,
      $2
    )
      RETURNING *;
  `;

  const {rows: [managerEvent]} = await db.query(sql, [managerId, eventId]);
  return managerEvent;
}

export const getManagersByEventId = async (eventId) => {
  const sql = `
    SELECT users.* FROM users
    JOIN managers_events ON users.id = managers_events.manager_id
    JOIN events ON events.id = managers_events.event_id
    WHERE events.id = $1;
  `;

  const {rows: managers} = await db.query(sql, [eventId])
  return managers;
}

export const getEventsByManagerId = async (managerId) => {
  const sql = `
    SELECT events.* FROM events
    JOIN managers_events ON events.id = managers_events.event_id
    JOIN users ON users.id = managers_events.manager_id
    WHERE users.id = $1;
  `;

  const {rows: events} = await db.query(sql, [managerId])
  return events;
}

export const deleteManagerEventByManagerId = async (managerId) => {
  const sql = `
    DELETE FROM managers_events
    WHERE manager_id = $1
    RETURNING *;
  `;

  const {rows: deletedManagerEvent} = await db.query(sql, [managerId]);
  return deletedManagerEvent;
}

export const deleteManagerEventByEventId = async (eventId) => {
  const sql = `
    DELETE FROM managers_events
    WHERE event_id = $1
    RETURNING *;
  `;

  const {rows: deletedManagerEvent} = await db.query(sql, [eventId]);
  return deletedManagerEvent;
}