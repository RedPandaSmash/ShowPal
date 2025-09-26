import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import DefaultList from "../models/defaultList.model.js";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;
  const takenUser = await User.findOne({ username });
  const takenEmail = await User.findOne({ email });

  if (takenUser) {
    console.log("That username is already.");
    res.json({
      message: "That username is already taken.",
    });
  }
  if (takenEmail) {
    console.log("That email is already being used.");
    res.json({
      message: "That email is already being used.",
    });
  }

  try {
    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      username,
    });

    const savedUser = await newUser.save();

    // Create profile for the new user
    const newProfile = new Profile({
      userID: savedUser._id,
      bio: "",
    });
    await newProfile.save();

    // Create default lists for the new user
    await DefaultList.createDefaultListsForUser(savedUser._id);

    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3h" }
    );
    res.json({
      message: "User made successfully",
      savedUser,
      token,
    });
  } catch (error) {
    console.error(error);
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const foundUser = await User.findOne({ email });
  const verifyPwd = await bcrypt.compare(password, foundUser.password);

  if (!foundUser || !verifyPwd) {
    return res.status(401).json({
      error: "invalid password or email",
    });
  }

  const token = jwt.sign(
    {
      id: foundUser._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );

  res.status(200).json({
    user: foundUser,
    token: token,
    message: "User logged in successfully",
  });
  try {
  } catch (error) {
    console.error(error);
  }
});

// Route to verify JWT token validity
router.post("/verify", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ valid: false, message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, decoded });
  } catch (err) {
    return res
      .status(401)
      .json({ valid: false, message: "Invalid or expired token" });
  }
});

// Return only the username for a given user ID. No sensitive fields.
router.get("/:id/username", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "No id provided" });
    const user = await User.findById(id).select("username").exec();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ username: user.username });
  } catch (err) {
    console.error("username lookup error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
