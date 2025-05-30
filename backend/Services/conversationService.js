// src/services/conversationService.js
const { Op } = require('sequelize');
const Conversation = require('../Models/Conversation');

class ConversationService {
  /** Create a new conversation for a given user */
  static async start(userId) {
    return Conversation.create({ user_id: userId });
  }

  /** Fetch a single conversation by its primary key */
  static async findById(id) {
    const convo = await Conversation.findByPk(id);
    if (!convo) throw new Error('Conversation not found');
    return convo;
  }

  /** List (optionally filtered) conversations */
  static async list({ userId, activeOnly = false, limit = 20, offset = 0 } = {}) {
    const where = {};
    if (userId) where.user_id = userId;
    if (activeOnly) where.ended_at = { [Op.is]: null };

    return Conversation.findAndCountAll({
      where,
      order: [['started_at', 'DESC']],
      limit,
      offset,
    });
  }

  /** Mark a conversation as ended (sets ended_at) */
  static async end(id) {
    const convo = await ConversationService.findById(id);
    convo.ended_at = new Date();
    return convo.save();
  }

  /** Hard-delete a conversation */
  static async delete(id) {
    const convo = await ConversationService.findById(id);
    await convo.destroy();
    return { deleted: true };
  }
}

module.exports = ConversationService;
