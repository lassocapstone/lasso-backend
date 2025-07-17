import express from "express";
const router = express.Router();
export default router;

import { createUser, getUserById, getUserByUsernameAndPassword, putUserAccountType } from "#db/queries/users";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import requireOrganizer from "#middleware/requireOrganizer";
import { createToken } from "#utils/jwt";

router
  .route("/")
  .get(
    requireUser,
    async (req, res) => {
      const {id} = req.user;
      const user = await getUserById(id);
      res.send(user);
  });

router
  .route("/:userId")
  .put(
    requireUser,
    requireOrganizer,
    requireBody(["accountType"]),
    async (req, res) => {
      const {accountType, userId} = req.body;
      const updatedUser = await putUserAccountType(accountType, userId);
      res.send(updatedUser);
  })

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
    res.send(token);
  });


