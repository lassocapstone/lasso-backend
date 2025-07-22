import db from "#db/client";
import { createManagersEvents } from "#db/managersEvents";
import { createSubordinatesEvents } from "#db/subordinatesEvents";

await async function seed() {
  await createManagersEvents(2, 1);
  await createManagersEvents(3, 1);

  await createSubordinatesEvents(4, 1, 2);
  await createSubordinatesEvents(5, 1, 2);
  await createSubordinatesEvents(6, 1, 2);
  await createSubordinatesEvents(7, 1, 3);
  await createSubordinatesEvents(8, 1, 3);
  await createSubordinatesEvents(9, 1, 3);
  await createSubordinatesEvents(10, 1, 3);
  await createSubordinatesEvents(11, 1, 3);
  await createSubordinatesEvents(12, 1, 3);
  await createSubordinatesEvents(14, 1, 2);
  await createSubordinatesEvents(13, 1, 2);
  await createSubordinatesEvents(15, 1, 2);
  await createSubordinatesEvents(16, 1, 2);
  await createSubordinatesEvents(17, 1, 2);

  await createSubordinatesEvents(6, 2, 3);
};
