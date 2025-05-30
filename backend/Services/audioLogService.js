// src/services/audioLogService.js
const AudioLog = require('../Models/AudioLog');
const Message  = require('../Models/Message');

class AudioLogService {
  /** Create an audio-log record linked to an existing voice message */
  static async create({ message_id, audio_url, duration_seconds = null }) {
    // 1) Ensure the message exists and is a 'voice' message
    const msg = await Message.findByPk(message_id);
    if (!msg)              throw new Error('Message not found');
    if (msg.message_type !== 'voice')
      throw new Error('Message is not of type "voice"');

    // 2) Create the audio log
    return AudioLog.create({ message_id, audio_url, duration_seconds });
  }

  /** Retrieve a single AudioLog by id */
  static async findById(id) {
    const log = await AudioLog.findByPk(id);
    if (!log) throw new Error('AudioLog not found');
    return log;
  }

  /** List audio logs (optionally filtered by message) */
  static async list({ messageId, limit = 50, offset = 0 } = {}) {
    const where = messageId ? { message_id: messageId } : {};
    return AudioLog.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      limit,
      offset,
    });
  }

  /** Delete an audio log */
  static async delete(id) {
    const log = await AudioLogService.findById(id);
    await log.destroy();
    return { deleted: true };
  }
}

module.exports = AudioLogService;
