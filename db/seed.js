import db from "#db/client";
import { createUser, getUserById } from "#db/queries/users";
import { createEmergencyContact } from "#db/queries/emergencycontact";
import { faker } from "@faker-js/faker";

import { getAlertById, getAlertsByEvent, getAlertsBySender, createAlert } from "#db/queries/alerts";
import { deleteEventById, createEvent, getEventById, getEventsByOrganizer } from "#db/queries/events";
import { createTask, getTaskById, getTasksByEvent, deleteTaskById } from "#db/queries/tasks";
import { getUserByUsernameAndPassword } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  //as of current every user has the same emergency contact at id 1.
  await createEmergencyContact("5555555555", faker.person.fullName(), "family");
  await createUser(
    faker.person.fullName(),
    faker.internet.username(),
    "password",
    "org",
    "5551112222"
  );

  for (let i = 1; i < 4; i++) {
    await createUser(
      faker.person.fullName(),
      faker.internet.username(),
      "password",
      "man",
      "5551112222"
    );
  }

  for (let i = 1; i < 10; i++) {
    await createUser(
      faker.person.fullName(),
      faker.internet.username(),
      "password",
      "sub",
      "5551112222"
    );
  }
  // console.log(await deleteTaskById(id));
  // console.log(await getTasksByEvent(eventid));
  // console.log(await getTaskById(id));
  // console.log(await createTask(eventId, name, startTime, endTime, location, instructions));
  // (id)- (eventid)- (id)- (eventId, name, startTime, endTime, location, instructions

  // console.log(await deleteEventById(id)); 
  // console.log(await getEventsByOrganizer(organizerId)); 
  // console.log(await getEventById(id)); 
  // console.log(await createEvent(name, organizerId));
  // (id)- (organizerId)- (id)- (name, organizerId)

  // console.log(await getAlertsBySender(senderId)); 
  // console.log(await getAlertsByEvent(eventId)); 
  // console.log(await getAlertById(id)); 
  // console.log(await createAlert(isOkay, name, message, eventId, senderId));
  // (senderId)- (eventId)- (id)- (isOkay, name, message, eventId, senderId)

  console.log(await getUserById(2));
}


// getUserByUsernameAndPassword(username, password)

//testing branch
console.log('test');



