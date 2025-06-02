// src/routes/conversationRoutes.js
const express = require('express');
const ConversationController = require('../Controllers/conversationController');
const auth = require('../Middleware/AuthToken'); // JWT middleware
const router = express.Router();

/** -----------------------------------------
 *  /api/conversations
 *  ----------------------------------------*/
router.post('/', auth, ConversationController.start);
router.get('/:id', auth, ConversationController.get);
router.get('/', auth, ConversationController.list);
router.patch('/:id/end', auth, ConversationController.end);
router.patch('/:id', auth, ConversationController.update); 
router.delete('/:id', auth, ConversationController.remove);


module.exports = router;
