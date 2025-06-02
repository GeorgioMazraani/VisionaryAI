/**********************************************************************
 *  Real-time layer – Socket.IO + GPT-4o auto-reply
 *  ------------------------------------------------------------------
 *  server.js / app.js example:
 *      const server = http.createServer(app);
 *      registerSocket(server);
 *********************************************************************/
require("dotenv").config();
const { Server }          = require("socket.io");
const { verifyToken }     = require("./Middleware/AuthToken");

const Conversation        = require("./Models/Conversation");
const Message             = require("./Models/Message");
const AIRequestService    = require("./Services/aiRequestService");

/* ——————————————————————————————————————————— */
let io;                       // singleton
const ioOpts = { cors: { origin: "*" } };

/* helper: emit last-message preview to every client */
async function emitPreview(conversationId) {
  const last = await Message.findOne({
    where: { conversation_id: conversationId },
    order: [["created_at", "DESC"]],
  });

  io.emit("conversationUpdated", {
    conversationId,
    lastMessage: last
      ? { text: last.message_text, created_at: last.created_at }
      : null,
  });
}

/* helper: create + broadcast an AI reply */
async function createAiReply({ conversationId, prompt }) {
  try {
    const aiLog   = await AIRequestService.create({ conversation_id: conversationId, prompt });
    const content = aiLog.response || "[empty]";

    const aiMsg = await Message.create({
      conversation_id: conversationId,
      sender: "ai",
      message_text: content,
      message_type: "text",
    });

    io.to(String(conversationId)).emit("newMessage", aiMsg.toJSON());
    await emitPreview(conversationId);
  } catch (err) {
    console.error("✖ AI reply failed:", err.message);
  }
}

/* ——————————————————————————————————————————— */
function registerSocket(httpServer) {
  if (io) return io;          // already initialised

  io = new Server(httpServer, ioOpts);

  io.on("connection", async (socket) => {
    /* 1 – JWT handshake */
    const { token } = socket.handshake.auth || {};
    let payload;
    try {
      payload = verifyToken(token);
      console.log("✓ socket auth ok user:", payload.id);
    } catch (err) {
      console.error("✖ socket auth failed:", err.message);
      return socket.disconnect(true);
    }

    socket.data.userId = payload.id;
    socket.join(String(payload.id));      // personal room (optional)

    /* 2 – room management */
    socket.on("joinConversation",  ({ conversationId }) => {
      if (conversationId) socket.join(String(conversationId));
    });
    socket.on("leaveConversation", ({ conversationId }) => {
      if (conversationId) socket.leave(String(conversationId));
    });

    /* 3 – user sends message  ➜  AI replies */
    socket.on("sendMessage", async ({ conversationId, text, imageUrl = null }) => {
      try {
        if (!conversationId) throw new Error("conversationId missing");
        if (!text && !imageUrl) throw new Error("Empty message");

        const convo = await Conversation.findByPk(conversationId);
        if (!convo) throw new Error("Conversation not found");

        /* 3a – persist the user message */
        const userMsg = await Message.create({
          conversation_id: conversationId,
          sender: "user",
          message_text: text ?? imageUrl,
          message_type: imageUrl ? "image" : "text",
        });

        /* 3b – broadcast it */
        io.to(String(conversationId)).emit("newMessage", userMsg.toJSON());
        await emitPreview(conversationId);

        /* 3c – trigger GPT-4o reply (async) */
        if (text) {
          createAiReply({ conversationId, prompt: text }).catch(console.error);
        }

      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    /* 4 – edit */
    socket.on("editMessage", async ({ messageId, conversationId, newText }) => {
      const msg = await Message.findByPk(messageId);
      if (!msg || msg.conversation_id !== conversationId) return;
      if (msg.sender !== "user" || socket.data.userId !== payload.id) return;

      msg.message_text = newText;
      await msg.save();
      io.to(String(conversationId)).emit("messageEdited", msg.toJSON());
      await emitPreview(conversationId);
    });

    /* 5 – delete */
    socket.on("deleteMessage", async ({ messageId, conversationId }) => {
      const msg = await Message.findByPk(messageId);
      if (!msg) return;
      if (msg.sender !== "user" || socket.data.userId !== payload.id) return;

      await msg.destroy();
      io.to(String(conversationId)).emit("messageRemoved", { messageId });
      await emitPreview(conversationId);
    });

    socket.on("disconnect", () => console.log("socket disconnect", socket.id));
  });

  console.log("✓ Socket.IO initialised");
  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialised – call registerSocket() first");
  return io;
}

module.exports = { registerSocket, getIO };
