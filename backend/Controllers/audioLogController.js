// src/controllers/audioLogController.js
const AudioLogService = require('../Services/audioLogService');

const send = (res, status, data) => res.status(status).json(data);

class AudioLogController {
  // POST /api/audio-logs
  static async create(req, res, next) {
    try {
      const { message_id, audio_url, duration_seconds } = req.body;
      if (!message_id || !audio_url)
        return send(res, 400, { error: 'message_id and audio_url are required' });

      const log = await AudioLogService.create({
        message_id,
        audio_url,
        duration_seconds,
      });
      return send(res, 201, log);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/audio-logs/:id
  static async get(req, res, next) {
    try {
      const log = await AudioLogService.findById(req.params.id);
      return send(res, 200, log);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/audio-logs
  static async list(req, res, next) {
    try {
      const { message_id, limit, offset } = req.query;
      const logs = await AudioLogService.list({
        messageId: message_id,
        limit:  Number(limit)  || 50,
        offset: Number(offset) || 0,
      });
      return send(res, 200, logs);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/audio-logs/:id
  static async remove(req, res, next) {
    try {
      const result = await AudioLogService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AudioLogController;
