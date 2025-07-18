import express from "express";
const router = express.Router();
export default router;

import requireUser from "#middleware/requireUser";
import requireEvent from "#middleware/requireEvent";
import requireBody from "#middleware/requireBody";
import requireOrganizer from "#middleware/requireOrganizer";
import { createEvent, deleteEventById, getEventById, getEventsByOrganizer, updateEventById } from "#db/queries/events";
import { getEventsByManagerId } from "#db/queries/managersEvents";
import { getEventsBySubordinateId } from "#db/queries/subordinatesEvents";

router.use(requireUser);

router
  .route("/")
  .get(
    async (req, res) => {
      const {id: userId, account_type: accountType} = req.user;
      
      let events;
      switch(accountType){
        case "org": 
          events = await getEventsByOrganizer(userId);
          break;
        case "man":
          events = await getEventsByManagerId(userId);
          break;
        case "sub":
          events = await getEventsBySubordinateId(userId);        
      }

      res.send(events);
  })
  .post(
    requireOrganizer,
    requireBody(["name", "startTime", "endTime", "location"]),
    async (req, res) => {
      const {name, startTime, endTime, location} = req.body;


      const newEvent = await createEvent(name, startTime, endTime, location, req.user.id);
      res.status(201).send(newEvent);
  });

router
  .route("/:eventId")
  .get(
    requireEvent,
    async (req, res) => {
      const {eventId} = req.params;
      const {id: userId, account_type: accountType} = req.user;
      
      let events;
      switch(accountType){
        case "org": 
          events = await getEventsByOrganizer(userId);
          break;
        case "man":
          events = await getEventsByManagerId(userId);
          break;
        case "sub":
          events = await getEventsBySubordinateId(userId);        
      }
      if(!events) return res.status(403).send("You are not part of this event");

      let inEvent = false;
      events.forEach((curEvent) => {
        if(curEvent.id === Number(eventId)) {
          inEvent = true;
        }
      })

      if(inEvent) {
        const event = await getEventById(eventId);
        res.send(event);
      }else {      
        res.status(403).send("You are not part of this event");
      }
  });

router
  .route("/:eventId/settings")
  .get(
    requireOrganizer,
    requireEvent,
    async (req, res) => {
      const { eventId } = req.params;

      const event = await getEventById(eventId);
      if(!event) res.status(404).send("That event does not exist");

      res.send(event);
  })
  .put(
    requireOrganizer,
    requireBody(["name", "startTime", "endTime", "location"]),
    async (req, res) => {
      const { eventId } = req.params;
      const { name, startTime, endTime, location } = req.body;

      const updatedEvent = await updateEventById(eventId, name, startTime, endTime, location, req.user.id);
      res.send(updatedEvent);
  })
  .delete(
    requireOrganizer,
    requireEvent,
    async (req, res) => {
      const {eventId} = req.params;
      await deleteEventById(eventId);
      res.status(204).send("Event deleted");
    }
  )

import tasksRouter from "#api/tasks";
import alertsRouter from "#api/alerts";
import rosterRouter from "#api/rosters";
router.use("/:eventId/tasks", requireEvent, tasksRouter);  
router.use("/:eventId/alerts", requireEvent, alertsRouter);
router.use("/:eventId/roster", requireEvent, rosterRouter);