import express from "express";
const router = express.Router();
export default router;

import requireUser from "../middleware/requireUser.js";
import { createEvent, getEventById, getEventsByOrganizer } from "#db/queries/events";
import requireBody from "#middleware/requireBody";
import requireOrganizer from "#middleware/requireOrganizer";
import { getEventsByManagerId } from "#db/queries/managersEvents";
import { getEventsBySubordinateId } from "#db/queries/subordinatesEvents";

router.use(requireUser);

router
  .route("/events")
  .get(
    async (req, res) => {
      const {id: userId, accountType} = req.body;
      
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
    requireBody([name, startTime, endTime, location, organizerId]),
    async (req, res) => {
      const {name, startTime, endTime, location, organizerId} = req.body;

      const newEvent = await createEvent(name, startTime, endTime, location, organizerId);
      res.send(newEvent);
    }
  )