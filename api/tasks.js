import express from "express";
const tasksRouter = express.Router();
export default tasksRouter;

import requireEvent from "#middleware/requireEvent";
import requireTask from "#middleware/requireTask";

import { getTaskById } from "#db/queries/tasks";
import { deleteTaskById } from "#db/queries/tasks";
import { getEventById } from "#db/queries/events";
import requireOrganizer from "#middleware/requireOrganizer";

tasksRouter.use(requireEvent);

tasksRouter.get("/", async (req, res) => {

});

tasksRouter.post("/", requireOrganizer, async (req, res) => {
 
});

tasksRouter.get("/:taskId", requireTask, async (req, res) => {
  
});

tasksRouter.put("/:taskId", requireTask, requireOrganizer, async (req, res) => {
  
});

tasksRouter.delete("/:taskId", requireTask, requireOrganizer, async (req, res) => {

});
