// src/services/messageService.js
const { Op } = require('sequelize');
const Message = require('../Models/Message');

class MessageService {
  /** Create a message (text OR uploaded file) */
  static async create({ conversation_id, sender, type, content }) {
    return Message.create({
      conversation_id,
      sender,
      message_type: type,
      message_text: content ?? null,  // for files we store the URL/path here
    });
  }

  /** Get a single message */
  static async findById(id) {
    const msg = await Message.findByPk(id);
    if (!msg) throw new Error('Message not found');
    return msg;
  }

  /** List messages with optional filters + pagination */
  static async list({ conversationId, since, limit = 50, offset = 0 } = {}) {
    const where = {};
    if (conversationId) where.conversation_id = conversationId;
    if (since)         where.created_at      = { [Op.gt]: since };

    return Message.findAndCountAll({
      where,
      order: [['created_at', 'ASC']],
      limit,
      offset,
    });
  }

  /** Delete a message */
  static async delete(id) {
    const msg = await MessageService.findById(id);
    await msg.destroy();
    return { deleted: true };
  }
}

module.exports = MessageService;
