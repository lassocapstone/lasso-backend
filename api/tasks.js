import express from "express";
const router = express.Router();
export default router;

import requireTask from "#middleware/requireTask";

import { getTaskById, deleteTaskById, updateTaskById, createTask, getTasksByEvent } from "#db/queries/tasks";
import requireOrganizer from "#middleware/requireOrganizer";
import requireBody from "#middleware/requireBody";

router.route("/")
  .get(
    async (req, res) => {
      const tasks = await getTasksByEvent(req.event.id);
      res.send(tasks);
})
  .post(
    requireOrganizer,
    requireBody(["name", "startTime", "endTime", "location", "instructions"]),
    async (req, res) => {
      const {name, startTime, endTime, location, instructions} = req.body;
      const task = await createTask(req.event.id, name, startTime, endTime, location, instructions);
      res.status(201).send(task);
});

router.route("/:taskId")
  .get(
    requireTask, 
    async (req, res) => {
      const {taskId} = req.params;
      const task = await getTaskById(taskId);
      res.send(task);
})
  .put(
    requireTask,
    requireOrganizer,
    requireBody(["eventId", "name", "startTime", "endTime", "location", "instructions"]),
    async (req, res) => {
      const {taskId} = req.params;
      const {eventId, name, startTime, endTime, location, instructions} = req.body;

      const updatedTask = await updateTaskById(taskId, eventId, name, startTime, endTime, location, instructions);
      res.send(updatedTask);
})
  .delete(
    requireTask, 
    requireOrganizer,
    async (req, res) => {
      const {taskId} = req.params;
      await deleteTaskById(taskId);
      res.status(204).send("Task deleted");
});
