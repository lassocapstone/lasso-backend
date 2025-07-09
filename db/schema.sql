DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS managers_events;
DROP TABLE IF EXISTS subordinates_events;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS emergency_contact;
 
CREATE TABLE emergency_contact (
  id SERIAL PRIMARY KEY,
  contact_number CHAR(10) NOT NULL,
  name VARCHAR(30) NOT NULL,
  relationship VARCHAR(30)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL, 
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(98) NOT NULL,
  account_type CHAR(3),
  contact_number CHAR(10) NOT NULL,
  role VARCHAR(30),
  status BOOLEAN,
  emergency_contact_id INTEGER REFERENCES emergency_contact(id) ON DELETE CASCADE
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subordinates_events (
  id SERIAL PRIMARY KEY,
  subordinate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE managers_events (
  id SERIAL PRIMARY KEY,
  manager_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  is_okay BOOLEAN NOT NULL,
  name VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(30) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(30) NOT NULL,
  instructions TEXT
);







