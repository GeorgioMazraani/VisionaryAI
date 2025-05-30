// src/controllers/imageCaptureController.js
const path                  = require('path');
const ImageCaptureService   = require('../Services/imageCaptureService');

const send = (res, status, data) => res.status(status).json(data);

class ImageCaptureController {
  // POST /api/image-captures
  static async create(req, res, next) {
    try {
      const { conversation_id } = req.body;
      const file = req.file;

      if (!conversation_id)
        return send(res, 400, { error: 'conversation_id is required' });
      if (!file)
        return send(res, 400, { error: 'Image file is required' });

      const capture = await ImageCaptureService.create({
        conversation_id,
        image_url: path.join('/uploads', file.filename),
      });

      return send(res, 201, capture);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/image-captures/:id
  static async get(req, res, next) {
    try {
      const capture = await ImageCaptureService.findById(req.params.id);
      return send(res, 200, capture);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/image-captures
  static async list(req, res, next) {
    try {
      const { conversation_id, limit, offset } = req.query;
      const captures = await ImageCaptureService.list({
        conversationId: conversation_id,
        limit:  Number(limit)  || 50,
        offset: Number(offset) || 0,
      });
      return send(res, 200, captures);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/image-captures/:id
  static async remove(req, res, next) {
    try {
      const result = await ImageCaptureService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = ImageCaptureController;
