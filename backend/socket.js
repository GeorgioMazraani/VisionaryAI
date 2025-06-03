/**************************************************************************
 *  src/realtime/socket.js
 *  ----------------------------------------------------------------------
 *  Real-time layer (Socket.IO) + GPT-4o auto-reply that can “look” at an
 *  uploaded image *and* read the accompanying text. 100 % copy-pastable.
 **************************************************************************/

require("dotenv").config();
const { Server } = require("socket.io");
const { verifyToken } = require("./Middleware/AuthToken");

const Conversation = require("./Models/Conversation");
const Message = require("./Models/Message");
const AIRequestService = require("./Services/aiRequestService");

/* ──────────────────────────────────────────────────────────────────── */
let io;                         // Singleton instance
const ioOpts = { cors: { origin: "*" } };

/* Helper → emit the last-message preview to every client  */
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

/* Helper → ask GPT-4o for a reply (supports vision + text)            */
async function createAiReply({ conversationId, text = "", imageUrl = null }) {
  try {
    /* ▸ 1.  Build the payload for the AI service                       */
    const aiPayload = {
      conversation_id: conversationId,
      prompt: text || "[image-only prompt]",
      image_url: imageUrl
        ? `https://70e7-94-187-20-2.ngrok-free.app${imageUrl.replace(/\\/g, '/')}`
        : null,


    };

    /* ▸ 2.  Call your OpenAI / GPT-4o wrapper                          */
    const aiLog = await AIRequestService.create(aiPayload);
    const content = aiLog.response || "[empty]";

    /* ▸ 3.  Persist the AI message                                     */
    const aiMsg = await Message.create({
      conversation_id: conversationId,
      sender: "ai",
      message_text: content,
      message_type: "text",
    });

    /* ▸ 4.  Broadcast + preview                                        */
    io.to(String(conversationId)).emit("newMessage", aiMsg.toJSON());
    await emitPreview(conversationId);
  } catch (err) {
    console.error("✖ AI reply failed:", err.message);
  }
}

/* ──────────────────────────────────────────────────────────────────── */
function registerSocket(httpServer) {
  if (io) return io;                // already initialised (singleton)

  io = new Server(httpServer, ioOpts);

  io.on("connection", async (socket) => {
    /* 1.  JWT handshake --------------------------------------------- */
    const { token } = socket.handshake.auth || {};
    let payload;
    try {
      payload = verifyToken(token);
      console.log("✓ socket auth OK  user:", payload.id);
    } catch (err) {
      console.error("✖ socket auth failed:", err.message);
      return socket.disconnect(true);
    }

    socket.data.userId = payload.id;
    socket.join(String(payload.id));          // personal room (optional)

    /* 2.  Room management ------------------------------------------- */
    socket.on("joinConversation", ({ conversationId }) => {
      if (conversationId) socket.join(String(conversationId));
    });
    socket.on("leaveConversation", ({ conversationId }) => {
      if (conversationId) socket.leave(String(conversationId));
    });

    /* 3.  User sends message  → AI replies -------------------------- */
    socket.on("sendMessage", async ({ conversationId, text, imageUrl = null }) => {
      try {
        /* 3a. Basic validation */
        if (!conversationId) throw new Error("conversationId missing");
        if (!text && !imageUrl) throw new Error("Empty message");

        const convo = await Conversation.findByPk(conversationId);
        if (!convo) throw new Error("Conversation not found");

        /* 3b. Persist + broadcast the user message(s)                 */
        const createdMessages = [];

        /* Image first (so UI can show it immediately) */
        if (imageUrl) {
          const imgMsg = await Message.create({
            conversation_id: conversationId,
            sender: "user",
            message_text: imageUrl,          // store URL/path
            message_type: "image",
          });
          createdMessages.push(imgMsg);
          io.to(String(conversationId)).emit("newMessage", imgMsg.toJSON());
        }

        /* Then text, if provided                                       */
        if (text) {
          const txtMsg = await Message.create({
            conversation_id: conversationId,
            sender: "user",
            message_text: text,
            message_type: "text",
          });
          createdMessages.push(txtMsg);
          io.to(String(conversationId)).emit("newMessage", txtMsg.toJSON());
        }

        /* 3c. Update preview                                           */
        await emitPreview(conversationId);

        /* 3d. Trigger GPT-4o reply (async)                             */
        createAiReply({ conversationId, text, imageUrl }).catch(console.error);

      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    /* 4.  Edit message ---------------------------------------------- */
    socket.on("editMessage", async ({ messageId, conversationId, newText }) => {
      const msg = await Message.findByPk(messageId);
      if (!msg || msg.conversation_id !== conversationId) return;
      if (msg.sender !== "user" || socket.data.userId !== payload.id) return;

      msg.message_text = newText;
      await msg.save();
      io.to(String(conversationId)).emit("messageEdited", msg.toJSON());
      await emitPreview(conversationId);
    });

    /* 5.  Delete message -------------------------------------------- */
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

/* ──────────────────────────────────────────────────────────────────── */
function getIO() {
  if (!io) throw new Error("Socket.IO not initialised — call registerSocket() first");
  return io;
}

module.exports = { registerSocket, getIO };
