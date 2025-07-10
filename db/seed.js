import db from "#db/client";
import { createUser } from "#db/queries/users";
import { createEvent } from "#db/queries/events";
import { createAlert } from "#db/queries/alerts";
import { createTask } from "#db/queries/tasks";
import {
  createSubordinatesEvents,
  getSubordinatesByEventId,
} from "#db/queries/subordinatesEvents";
import { createManagersEvents } from "#db/queries/managersEvents";
import { createEmergencyContact } from "#db/queries/emergencycontact";
import { faker } from "@faker-js/faker";
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
  //events have:
  //name, start_time, end_time, location, organizer_id

  await createEvent(
    "Museum Visit",
    "14:00:00",
    "18:00:00",
    "The museum of stuff",
    1
  );

  await createEvent(
    "Museum buyout",
    "15:00:00",
    "19:00:00",
    "Things the museum",
    1
  );

  //alerts have:
  //is_okay, name, message, event_id, sender_id
  await createAlert("true", "stairs hard", "bobby fell down the stairs", 1, 2);
  await createAlert(
    "true",
    "stairs super hard",
    "jimmy fell down the stairs",
    2,
    2
  );
  await createAlert("false", "bad stairs", "sally fell down the stairs", 1, 3);

  //tasks have:
  //event_id, name, start_time, end_time, location, instructions
  await createTask(
    1,
    "Take Attendance Upon arrival",
    "14:30:00",
    "14:35:00",
    "At the museum",
    "count your group members and report all good on task"
  );
  await createTask(
    2,
    "Take Attendance Upon arrival",
    "14:30:00",
    "14:35:00",
    "At the museum",
    "count your group members and report all good on task"
  );

  await createManagersEvents(2, 1);
  await createManagersEvents(3, 1);

  await createSubordinatesEvents(5, 1, 2);
  await createSubordinatesEvents(6, 2, 3);
}
