import db from "#db/client";

export const createTask = async (eventId, name, startTime, endTime, location, instructions) => {
  const sql = `
    INSERT INTO tasks (
      event_id,
      name,
      start_time,
      end_time,
      location,
      instructions
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

  const {rows: [newTask]} = await db.query(sql, [eventId, name, startTime, endTime, location, instructions]);
  return newTask;
}

export const getTaskById = async (id) => {
  const sql = `
    SELECT * FROM tasks
    WHERE id = $1;
  `;

  const {rows: [task]} = await db.query(sql, [id]);
  return task;
}

export const getTasksByEvent = async (eventId) => {
  const sql = `
    SELECT * FROM tasks
    WHERE event_id = $1;
  `;

  const {rows: tasks} = await db.query(sql, [eventId]);
  return tasks;
}

export const updateTaskById = async (taskId, eventId, name, startTime, endTime, location, instructions) => {
  const sql = `
    UPDATE tasks
    SET
      event_id = $2,
      name = $3,
      start_time = $4,
      end_time = $5,
      location = $6,
      instructions = $7
    WHERE id = $1
    RETURNING *;
  `;

  const {rows: updatedTask} = await db.query(sql, [taskId, eventId, name, startTime, endTime, location, instructions]);
  return updatedTask;
}

export const deleteTaskById = async (id) => {
  const sql = `
    DELETE FROM tasks
    WHERE id = $1
    RETURNING *;
  `;

  const {rows: [deletedTask]} = await db.query(sql, [id]);
  return deletedTask;
}