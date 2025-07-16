import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserById, getUserByUsernameAndPassword } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import { createToken } from "#utils/jwt";
import requireUser from "#middleware/requireUser";

router
  .route("/register")
  .post(requireBody(["name", "username", "password", "contact_number"]), async (req, res) => {
    const { name,
      username,
      password,
      account_type,
      contact_number,
      role,
      status,
      emergency_contact_id } = req.body;
    const user = await createUser(name,
      username,
      password,
      account_type,
      contact_number,
      role,
      status,
      emergency_contact_id);
    const token = await createToken({ id: user.id });
    res.status(201).send(token);
  });

router
  .route("/login")
  .post(requireBody(["username", "password"]), async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsernameAndPassword(username, password);
    if (!user) return res.status(401).send("Invalid username or password.");

    const token = await createToken({ id: user.id });

    res.send({ token, account_type: user.account_type });
  });

router.
  route('/')
  .get(requireUser, async (req, res) => {
    const user = await getUserById(req.user.id);
    if (!user) return res.status(404).send('Alert Not Found');
    res.send(user);
  });


