import db from "#db/client";
import { createUser } from "#db/queries/users";
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
}
