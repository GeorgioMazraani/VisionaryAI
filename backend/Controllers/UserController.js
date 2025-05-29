// controllers/UserController.js
const { validationResult } = require('express-validator');
const userSvc = require('../Services/UserService');

const UserController = {
  // GET /api/users
  async list(req, res) {
    try {
      const users = await userSvc.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/users/:id
  async get(req, res) {
    try {
      const user = await userSvc.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // POST /api/users
  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const newUser = await userSvc.createUser(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/users/:id/username
  async patchUsername(req, res) {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username needed' });

    try {
      await userSvc.updateUsername(req.params.id, username);
      res.json({ message: 'Username updated' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/users/:id/email
  async patchEmail(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email needed' });

    try {
      await userSvc.updateEmail(req.params.id, email);
      res.json({ message: 'Email updated' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/users/:id/password
  async patchPassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords required' });

    try {
      const result = await userSvc.changePassword(
        req.params.id,
        currentPassword,
        newPassword
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // DELETE /api/users/:id
  async remove(req, res) {
    try {
      const result = await userSvc.deleteUser(req.params.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
};

module.exports = UserController;
