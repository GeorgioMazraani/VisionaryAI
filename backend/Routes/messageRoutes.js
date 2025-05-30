// src/routes/messageRoutes.js
const express = require('express');
const upload = require('../Middleware/upload');
const MessageController = require('../Controllers/messageController');
const auth = require('../Middleware/AuthToken'); // JWT middleware
const router = express.Router();

/** -----------------------------------------
 *  /api/messages
 *  ----------------------------------------*/
router.post('/', auth, upload.single('file'), MessageController.create);
router.get('/:id', auth, MessageController.get);
router.get('/', auth, MessageController.list);
router.delete('/:id', auth, MessageController.remove);

module.exports = router;
