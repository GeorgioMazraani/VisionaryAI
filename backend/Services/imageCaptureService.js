// src/services/imageCaptureService.js
const ImageCapture  = require('../Models/ImageCapture');
const Conversation  = require('../Models/Conversation');

class ImageCaptureService {
  /** Store an image capture, checking that the conversation exists */
  static async create({ conversation_id, image_url, captured_at = new Date() }) {
    const convo = await Conversation.findByPk(conversation_id);
    if (!convo) throw new Error('Conversation not found');

    return ImageCapture.create({ conversation_id, image_url, captured_at });
  }

  /** Retrieve a single capture */
  static async findById(id) {
    const capture = await ImageCapture.findByPk(id);
    if (!capture) throw new Error('ImageCapture not found');
    return capture;
  }

  /** List captures, optionally filtered by conversation */
  static async list({ conversationId, limit = 50, offset = 0 } = {}) {
    const where = conversationId ? { conversation_id: conversationId } : {};
    return ImageCapture.findAndCountAll({
      where,
      order: [['captured_at', 'DESC']],
      limit,
      offset,
    });
  }

  /** Delete a capture */
  static async delete(id) {
    const capture = await ImageCaptureService.findById(id);
    await capture.destroy();
    return { deleted: true };
  }
}

module.exports = ImageCaptureService;
