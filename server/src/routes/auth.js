const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createStore } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "sight_and_sign_dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

// Persistent JSON file store: server/data/users.json
const memUsers = createStore("users");
let memIdCounter = memUsers.size + 1;

const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ─── Register ───────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, accessibilityType } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email and password are required." });

    const validRoles = ["student", "teacher", "admin"];
    const userRole = validRoles.includes(role) ? role : "student";

    const validA11yTypes = [
      "standard",
      "visually-impaired",
      "hearing-impaired",
    ];
    const userA11yType = validA11yTypes.includes(accessibilityType)
      ? accessibilityType
      : "standard";

    if (memUsers.has(email))
      return res.status(409).json({ message: "Email already registered." });

    const passwordHash = await bcrypt.hash(password, 10);
    const id = String(memIdCounter++);

    // Set default accessibility preferences based on type
    let accessibilityPrefs = {
      theme: "dark",
      fontSize: "medium",
      ttsSpeed: 1.0,
      captionSize: "medium",
      captionColour: "#FFFFFF",
      captionBg: "rgba(0,0,0,0.75)",
      keyboardNavMode: false,
      autoPlayTTS: false,
    };

    if (userA11yType === "visually-impaired") {
      accessibilityPrefs = {
        ...accessibilityPrefs,
        theme: "high-contrast",
        fontSize: "large",
        ttsSpeed: 1.2,
        keyboardNavMode: true,
        autoPlayTTS: true,
      };
    } else if (userA11yType === "hearing-impaired") {
      accessibilityPrefs = {
        ...accessibilityPrefs,
        captionSize: "large",
        autoPlayTTS: false,
      };
    }

    const user = {
      _id: id,
      id,
      name,
      email,
      passwordHash,
      role: userRole,
      accessibilityType: userA11yType,
      isActive: true,
      accessibilityPrefs,
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };
    memUsers.set(email, user);

    const token = signToken(id);
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const user = memUsers.get(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials." });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials." });
    if (!user.isActive)
      return res.status(403).json({ message: "Account is disabled." });

    const token = signToken(user._id);
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ message: err.message });
  }
});

// ─── Me ──────────────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ message: "No token." });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = [...memUsers.values()].find((u) => u._id === decoded.id);
    if (!user) return res.status(401).json({ message: "User not found." });
    const safeUser = { ...user };
    delete safeUser.passwordHash;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
module.exports.memUsers = memUsers; // Export so other routes can access
