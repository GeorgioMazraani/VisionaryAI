// services/UserService.js
const bcrypt = require('bcrypt');
const User = require('../Models/User');

const SALT_ROUNDS = 12;            // a bit stronger than 10

// ────────────────────────────────────────────────────────────
//  CREATE
// ────────────────────────────────────────────────────────────
async function createUser({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return User.create({
    username,
    email,
    password_hash: hashedPassword,
    created_at: new Date(),
  });
}

// ────────────────────────────────────────────────────────────
//  READ
// ────────────────────────────────────────────────────────────
async function getAllUsers() {
  return User.findAll({
    attributes: ['id', 'username', 'email', 'created_at'],
  });
}

async function getUserById(id) {
  return User.findByPk(id, {
    attributes: ['id', 'username', 'email', 'created_at'],
  });
}

// ────────────────────────────────────────────────────────────
//  UPDATE (PARTIAL — PATCH-STYLE)
// ────────────────────────────────────────────────────────────
async function updateUsername(id, username) {
  return User.update({ username }, { where: { id } });
}

async function updateEmail(id, email) {
  return User.update({ email }, { where: { id } });
}

async function changePassword(id, currentPassword, newPassword) {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) throw new Error('Current password incorrect');

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password_hash = hashed;
  await user.save();
  return { message: 'Password changed successfully' };
}

// ────────────────────────────────────────────────────────────
//  DELETE
// ────────────────────────────────────────────────────────────
async function deleteUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
  return { message: 'User deleted' };
}

// ────────────────────────────────────────────────────────────
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUsername,
  updateEmail,
  changePassword,
  deleteUser,
};
