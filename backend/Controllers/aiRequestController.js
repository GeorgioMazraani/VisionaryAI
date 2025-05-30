// src/controllers/aiRequestController.js
const AIRequestService = require('../Services/aiRequestService');

const send = (res, status, data) => res.status(status).json(data);

class AIRequestController {
  // POST /api/ai-requests  →  { conversation_id, prompt }
  static async create(req, res, next) {
    try {
      const { conversation_id, prompt } = req.body;
      if (!conversation_id || !prompt)
        return send(res, 400, { error: 'conversation_id and prompt are required' });

      const record = await AIRequestService.create({ conversation_id, prompt });
      return send(res, 201, record);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/ai-requests/:id
  static async get(req, res, next) {
    try {
      const record = await AIRequestService.findById(req.params.id);
      return send(res, 200, record);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/ai-requests
  static async list(req, res, next) {
    try {
      const { conversation_id, limit, offset } = req.query;
      const records = await AIRequestService.list({
        conversationId: conversation_id,
        limit:  Number(limit)  || 50,
        offset: Number(offset) || 0,
      });
      return send(res, 200, records);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/ai-requests/:id
  static async remove(req, res, next) {
    try {
      const result = await AIRequestService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AIRequestController;
