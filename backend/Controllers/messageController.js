// src/controllers/messageController.js
const path = require('path');
const MessageService = require('../Services/messageService');
const AudioLogService = require('../Models/AudioLog');
const ImageCaptureService = require('../Models/ImageCapture');
/** Helper to send JSON */
const send = (res, status, data) => res.status(status).json(data);

class MessageController {
  // POST /api/messages   (handles both 'text' & file uploads)
  static async create(req, res, next) {
    try {
      const { conversation_id, sender, message_text } = req.body;
      const file = req.file; // set by multer if present

      // Basic validation
      if (!conversation_id) return send(res, 400, { error: 'conversation_id is required' });
      if (!sender || !['user', 'ai'].includes(sender))
        return send(res, 400, { error: 'sender must be "user" or "ai"' });

      if (!message_text && !file)
        return send(res, 400, { error: 'Either message_text or a file is required' });

      const isFile = Boolean(file);
      const type = isFile ? (file.mimetype.startsWith('image/') ? 'image' : 'voice') : 'text';
      const content = isFile
        ? path.join('/uploads', file.filename)   // public URL or file path
        : message_text;

      const msg = await MessageService.create({
        conversation_id,
        sender,
        type,
        content,
      });
      if (type === 'voice') {
        await AudioLogService.create({
          message_id: message.id,
          audio_url: content,
          duration_seconds: null, // can later extract real duration with ffmpeg or frontend
        });
      }

      if (type === 'image') {
        await ImageCaptureService.create({
          conversation_id,
          image_url: content,
        });
      }

      return send(res, 201, msg);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/messages/:id
  static async get(req, res, next) {
    try {
      const msg = await MessageService.findById(req.params.id);
      return send(res, 200, msg);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/messages
  static async list(req, res, next) {
    try {
      const { conversation_id, since, limit, offset } = req.query;
      const result = await MessageService.list({
        conversationId: conversation_id,
        since,
        limit: Number(limit) || 50,
        offset: Number(offset) || 0,
      });
      return send(res, 200, result); // ✅ will now be just an array of messages

    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/messages/:id
  static async remove(req, res, next) {
    try {
      const result = await MessageService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = MessageController;
