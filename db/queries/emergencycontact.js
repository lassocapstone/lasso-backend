import db from "#db/client";

export async function createEmergencyContact(
  contact_number,
  name,
  relationship
) {
  const SQL =
    "INSERT INTO emergency_contact (contact_number, name, relationship) VALUES ($1, $2,$3) RETURNING *";

  const {
    rows: [emergencyContact],
  } = await db.query(SQL, [contact_number, name, relationship]);

  return emergencyContact;
}
