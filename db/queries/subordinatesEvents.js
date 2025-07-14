import db from "#db/client";

//allow for a connection between 'manager users' and events
export const createSubordinatesEvents = async (subordinateId, eventId, managerId) => {
  const sql = `
    INSERT INTO subordinates_events (
      subordinate_id,
      event_id,
      manager_id
    )
    VALUES (
      $1,
      $2,
      $3
    )
      RETURNING *;
  `;

  const {rows: [subordinateEvent]} = await db.query(sql, [subordinateId, eventId, managerId]);
  return subordinateEvent;
}

export const getEventsBySubordinateId = async (id) => {
 const sql = `
    SELECT events.* FROM events
    JOIN subordinates_events ON events.id = subordinates_events.event_id
    JOIN users ON users.id = subordinates_events.subordinate_id
    WHERE users.id = $1;
  `;

  const {rows: events} = await db.query(sql, [managerId])
  return events;
}

export const getSubordinatesByManagerId = async (managerId) => {
  const sql = `
    SELECT users.* FROM users
    JOIN subordinates_events ON users.id = subordinates_events.subordinate_id
    JOIN users ON users.id = subordinates_events.manager_id
    WHERE users.id = $1;
  `;

  const {rows: subordinates} = await db.query(sql, [managerId])
  return subordinates;
}

export const getSubordinatesByEventId = async (eventId) => {
  const sql = `
    SELECT events.* FROM events
    JOIN subordinates_events ON events.id = subordinates_events.event_id
    JOIN users ON users.id = subordinates_events.subordinate_id
    WHERE events.id = $1;
  `;

  const {rows: subordinates} = await db.query(sql, [eventId]);
  return subordinates;
}

export const updateSubordinateManagerByManagerId = async (newManagerId, oldManagerId) => {
  const sql = `
    UPDATE subordinates_events
      SET manager_id = $1
      WHERE manager_id = $2
    RETURNING *;
  `;

  const {rows: [updatedSubordinateEvent]} = await db.query(sql, [newManagerId, oldManagerId]);
  return updatedSubordinateEvent;
} 

export const deleteSubordinateEventBySubordinateId = async (subordinateId) => {
  const sql = `
    DELETE FROM subordinates_events
    WHERE subordinate_id = $1
    RETURNING *;
  `;

  const {rows: deletedSubordinateEvent} = await db.query(sql, [subordinateId]);
  return deletedSubordinateEvent;
}

export const deleteSubordinateEventByEventId = async (eventId) => {
  const sql = `
    DELETE FROM subordinates_events
    WHERE event_id = $1
    RETURNING *;
  `;

  const {rows: deletedSubordinateEvent} = await db.query(sql, [eventId]);
  return deletedSubordinateEvent;
}