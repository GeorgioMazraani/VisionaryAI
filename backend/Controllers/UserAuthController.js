const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
require("dotenv").config();

/**
 * Authenticates a user:
 * - With email + password
 * - With email + face descriptor
 * - With face descriptor only
 */
const userAuthController = async (req, res) => {
  const { email, password, faceDescriptor } = req.body;

  if (email && password) {
    return loginWithEmailPassword(email, password, res);
  }

  if (email && faceDescriptor) {
    return loginWithEmailAndFace(email, faceDescriptor, res);
  }

  if (faceDescriptor && !email && !password) {
    return loginWithFaceOnly(faceDescriptor, res);
  }

  return res.status(400).json({ message: "Invalid login parameters" });
};
async function loginWithEmailPassword(email, password, res) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Email/password login failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function loginWithEmailAndFace(email, faceDescriptor, res) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.faceDescriptor)
      return res.status(404).json({ message: "User or face data not found" });

    const match = compareDescriptors(parseDescriptor(user.faceDescriptor), parseDescriptor(faceDescriptor));
    if (!match) return res.status(401).json({ message: "Face does not match" });

    const token = generateToken(user);
    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error("Email + face login failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function loginWithFaceOnly(faceDescriptor, res) {
  try {
    const users = await User.findAll();
    const incoming = parseDescriptor(faceDescriptor);

    let bestMatch = null;
    let bestDistance = Infinity;
    const threshold = 0.6;

    for (const user of users) {
      if (!user.faceDescriptor) continue;

      const stored = parseDescriptor(user.faceDescriptor);
      const distance = euclideanDistance(stored, incoming);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = user;
      }
    }

    if (!bestMatch || bestDistance > threshold)
      return res.status(401).json({ message: "No face match found" });

    const token = generateToken(bestMatch);
    return res.status(200).json({ token, user: safeUser(bestMatch) });
  } catch (err) {
    console.error("Face-only login failed:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
function euclideanDistance(v1, v2) {
  if (v1.length !== v2.length) throw new Error("Mismatched descriptor length");
  return Math.sqrt(v1.reduce((sum, val, i) => sum + (val - v2[i]) ** 2, 0));
}

function compareDescriptors(desc1, desc2, threshold = 0.6) {
  return euclideanDistance(desc1, desc2) <= threshold;
}

function parseDescriptor(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return JSON.parse(raw);
  return raw;
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}
module.exports = userAuthController;
