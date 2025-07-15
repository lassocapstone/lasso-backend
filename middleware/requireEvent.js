import { getEventById } from "#db/queries/events";

export default async function requireEvent(req, res, next) {
  const {eventId} = req.params;

  const event = await getEventById(eventId);
  if(!event) return res.status(404).send("That event does not exist");

  next();
}