// src/controllers/conversationController.js
const ConversationService = require('../Services/conversationService');

/**
 * Standard JSON response helper
 */
const send = (res, status, data) => res.status(status).json(data);

class ConversationController {
  // POST /api/conversations
  static async start(req, res, next) {
    try {
      const { user_id } = req.body;
      if (!user_id) return send(res, 400, { error: 'user_id is required' });

      const conversation = await ConversationService.start(user_id);
      return send(res, 201, conversation);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/conversations/:id
  static async get(req, res, next) {
    try {
      const conversation = await ConversationService.findById(req.params.id);
      return send(res, 200, conversation);
    } catch (err) {
      return next(err);
    }
  }
  // PATCH /api/conversations/:id
static async update(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) return send(res, 400, { error: "Title is required" });

    const conversation = await ConversationService.updateTitle(req.params.id, title);
    return send(res, 200, conversation);
  } catch (err) {
    return next(err);
  }
}


  // GET /api/conversations
  static async list(req, res, next) {
    try {
      const { user_id, active, limit, offset } = req.query;
      const result = await ConversationService.list({
        userId: user_id,
        activeOnly: active === 'true',
        limit: Number(limit) || 20,
        offset: Number(offset) || 0,
      });
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }

  // PATCH /api/conversations/:id/end
  static async end(req, res, next) {
    try {
      const conversation = await ConversationService.end(req.params.id);
      return send(res, 200, conversation);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/conversations/:id
  static async remove(req, res, next) {
    try {
      const result = await ConversationService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ConversationController;
