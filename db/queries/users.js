import db from "#db/client";
import bcrypt from "bcrypt";

export async function createUser(
  name,
  username,
  password,
  account_type,
  contact_number,
  role,
  status,
  emergency_contact_id
) {
  const sql = `
  INSERT INTO users
    (name, username, password, account_type, contact_number, role, status, emergency_contact_id)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
  `;
  const hashedPassword = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await db.query(sql, [
    name,
    username,
    hashedPassword,
    account_type,
    contact_number,
    role,
    status,
    emergency_contact_id,
  ]);
  return user;
}

export async function getUserByUsernameAndPassword(username, password) {
  const sql = `
  SELECT *
  FROM users
  WHERE username = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [username]);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function getUserById(id) {
  const sql = `
  SELECT *
  FROM users
  WHERE id = $1
  `;
  const {
    rows: [user],
  } = await db.query(sql, [id]);
  return user;
}

export async function getUserAccountTypeById(userId) {
  const {
    rows: [accountType],
  } = await db.query(`SELECT account_type FROM users WHERE id = $1`, [userId]);
  return accountType;
}
