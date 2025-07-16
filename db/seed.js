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
  const testOrganizer = await createUser(
    "Diana Ross",
    "testOrg",
    "password",
    "org",
    "5555555555"
  );

   const testManager = await createUser(
    "Ricardo H. Coupons",
    "testMan",
    "password",
    "man",
    "5555555555"
  );

   const testSubordinate = await createUser(
    "Leeroy Jenkins",
    "testSub",
    "password",
    "sub",
    "5555555555"
  );

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
    "2025-07-13 14:00:00",
    "2025-07-13 18:00:00",
    "The museum of stuff",
    testOrganizer.id
  );

  await createEvent(
    "Museum buyout",
    "2025-07-14 15:00:00",
    "2025-07-14 19:00:00",
    "Things the museum",
    testOrganizer.id
  );

  //alerts have:
  //is_okay, name, message, event_id, sender_id
  await createAlert(
    "true", 
    "stairs hard", 
    "bobby fell down the stairs", 
    1,
    testOrganizer.id,
    testManager.id
  );
  
  await createAlert(
    "true",
    "stairs super hard",
    "jimmy fell down the stairs",
    2,
    testOrganizer.id,
    testManager.id
  );
  await createAlert(
    "false", 
    "bad stairs", 
    "sally fell down the stairs", 
    1,
    testOrganizer.id, 
    3
  );

  //tasks have:
  //event_id, name, start_time, end_time, location, instructions
  await createTask(
    1,
    "Take Attendance Upon arrival",
    "2025-07-13 14:30:00",
    "2025-07-13 14:35:00",
    "At the museum",
    "count your group members and report all good on task"
  );
  await createTask(
    2,
    "Take Attendance Upon arrival",
    "2025-07-14 15:30:00",
    "2025-07-14 15:35:00",
    "At the museum",
    "count your group members and report all good on task"
  );

  await createManagersEvents(testManager.id, 1);
  await createManagersEvents(3, 2);

  await createSubordinatesEvents(testSubordinate.id, 1, 2);
  await createSubordinatesEvents(6, 2, 3);
}
