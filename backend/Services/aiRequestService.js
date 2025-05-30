// src/services/aiRequestService.js
require('dotenv').config();               // ensure OPENAI_API_KEY is loaded
const { performance }  = require('perf_hooks');
const OpenAI           = require('openai');
const AIRequest        = require('../Models/AIRequest');
const Conversation     = require('../Models/Conversation');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIRequestService {
  /** Send a prompt to GPT-4o and persist the request/response */
  static async create({ conversation_id, prompt }) {
    // Verify conversation exists
    const convo = await Conversation.findByPk(conversation_id);
    if (!convo) throw new Error('Conversation not found');

    let success = true;
    let responseText = null;
    let latencyMs = null;

    const start = performance.now();
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      latencyMs     = Math.round(performance.now() - start);
      responseText  = completion.choices?.[0]?.message?.content ?? '';
    } catch (err) {
      latencyMs    = Math.round(performance.now() - start);
      success      = false;
      responseText = `ERROR: ${err.message}`;
    }

    // Persist log
    const record = await AIRequest.create({
      conversation_id,
      prompt,
      response: responseText,
      success,
      latency_ms: latencyMs,
    });

    return record;
  }

  /** Retrieve a single log */
  static async findById(id) {
    const req = await AIRequest.findByPk(id);
    if (!req) throw new Error('AIRequest not found');
    return req;
  }

  /** List logs (optionally by conversation) */
  static async list({ conversationId, limit = 50, offset = 0 } = {}) {
    const where = conversationId ? { conversation_id: conversationId } : {};
    return AIRequest.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  /** Delete a log */
  static async delete(id) {
    const req = await AIRequestService.findById(id);
    await req.destroy();
    return { deleted: true };
  }
}

module.exports = AIRequestService;
