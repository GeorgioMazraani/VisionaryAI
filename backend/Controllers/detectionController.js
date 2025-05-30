// src/controllers/detectionController.js
const DetectionService = require('../Services/detectionService');

const send = (res, status, data) => res.status(status).json(data);

class DetectionController {
  // POST /api/detections  (single OR batch)
  static async create(req, res, next) {
    try {
      const payload = req.body;

      // If the payload is an array → batch
      const isBatch = Array.isArray(payload);
      if (isBatch && payload.length === 0)
        return send(res, 400, { error: 'Empty array' });

      let result;
      if (isBatch) {
        result = await DetectionService.createMany(payload);
      } else {
        const { image_capture_id, label } = payload;
        if (!image_capture_id || !label)
          return send(res, 400, { error: 'image_capture_id and label are required' });

        result = await DetectionService.createOne(payload);
      }

      return send(res, 201, result);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/detections/:id
  static async get(req, res, next) {
    try {
      const det = await DetectionService.findById(req.params.id);
      return send(res, 200, det);
    } catch (err) {
      return next(err);
    }
  }

  // GET /api/detections
  static async list(req, res, next) {
    try {
      const { image_capture_id, limit, offset } = req.query;
      const dets = await DetectionService.list({
        imageCaptureId: image_capture_id,
        limit:  Number(limit)  || 100,
        offset: Number(offset) || 0,
      });
      return send(res, 200, dets);
    } catch (err) {
      return next(err);
    }
  }

  // DELETE /api/detections/:id
  static async remove(req, res, next) {
    try {
      const result = await DetectionService.delete(req.params.id);
      return send(res, 200, result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = DetectionController;
