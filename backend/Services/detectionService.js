// src/services/detectionService.js
const Detection     = require('../Models/Detection');
const ImageCapture  = require('../Models/ImageCapture');

class DetectionService {
  /** Verify the image exists, then create a detection */
  static async createOne({ image_capture_id, label, confidence, bounding_box }) {
    const img = await ImageCapture.findByPk(image_capture_id);
    if (!img) throw new Error('ImageCapture not found');

    return Detection.create({ image_capture_id, label, confidence, bounding_box });
  }

  /** Batch-insert an array of detections */
  static async createMany(detectionsArray) {
    // Validate all image_capture_ids first
    const ids = [...new Set(detectionsArray.map(d => d.image_capture_id))];
    const found = await ImageCapture.findAll({ where: { id: ids } });
    const foundIds = new Set(found.map(i => i.id));
    const missing  = ids.filter(id => !foundIds.has(id));
    if (missing.length) throw new Error(`Unknown image_capture_id(s): ${missing.join(', ')}`);

    return Detection.bulkCreate(detectionsArray);
  }

  /** Retrieve a detection */
  static async findById(id) {
    const det = await Detection.findByPk(id);
    if (!det) throw new Error('Detection not found');
    return det;
  }

  /** List detections (optionally by image_capture_id) */
  static async list({ imageCaptureId, limit = 100, offset = 0 } = {}) {
    const where = imageCaptureId ? { image_capture_id: imageCaptureId } : {};
    return Detection.findAndCountAll({
      where,
      order: [['confidence', 'DESC']],
      limit,
      offset,
    });
  }

  /** Delete a detection */
  static async delete(id) {
    const det = await DetectionService.findById(id);
    await det.destroy();
    return { deleted: true };
  }
}

module.exports = DetectionService;
