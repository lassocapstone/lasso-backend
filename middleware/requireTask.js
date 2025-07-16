import { getTaskById } from "#db/queries/tasks";

export default async function requireTask(req, res, next) {
  const {taskId} = req.params;

  const task = await getTaskById(taskId);
  if(!task) return res.status(404).send("That task does not exist");

  req.task = task;
  next();
}