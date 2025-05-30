/*  Central Model Registry + Associations
    ------------------------------------- */
const sequelize    = require('../Config/DBConfig');
const User         = require('./User');
const Conversation = require('./Conversation');
const Message      = require('./Message');
const AudioLog     = require('./AudioLog');
const ImageCapture = require('./ImageCapture');
const Detection    = require('./Detection');
const AIRequest    = require('./AIRequest');

/* ─── RELATIONS ──────────────────────────────────────────── */
// User → Conversation
User.hasMany(Conversation,   { foreignKey: 'user_id',   onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'user_id' });

// Conversation → Message
Conversation.hasMany(Message,   { foreignKey: 'conversation_id', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// Conversation → ImageCapture
Conversation.hasMany(ImageCapture,   { foreignKey: 'conversation_id', onDelete: 'CASCADE' });
ImageCapture.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// Conversation → AIRequest
Conversation.hasMany(AIRequest,   { foreignKey: 'conversation_id', onDelete: 'CASCADE' });
AIRequest.belongsTo(Conversation, { foreignKey: 'conversation_id' });

// Message → AudioLog (1 : 1)
Message.hasOne(AudioLog,  { foreignKey: 'message_id', onDelete: 'CASCADE' });
AudioLog.belongsTo(Message, { foreignKey: 'message_id' });

// ImageCapture → Detection (1 : N)
ImageCapture.hasMany(Detection,  { foreignKey: 'image_capture_id', onDelete: 'CASCADE' });
Detection.belongsTo(ImageCapture, { foreignKey: 'image_capture_id' });

/* ─── EXPORT ALL MODELS + SEQUELIZE ─────────────────────── */
module.exports = {
  sequelize,
  User,
  Conversation,
  Message,
  AudioLog,
  ImageCapture,
  Detection,
  AIRequest,
};
