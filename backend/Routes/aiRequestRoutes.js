// src/routes/aiRequestRoutes.js
const express = require('express');
const AIRequestController = require('../Controllers/aiRequestController');
const auth = require('../Middleware/AuthToken'); 
const router = express.Router();

/** -----------------------------------------
 *  /api/ai-requests
 *  ----------------------------------------*/
router.post('/', auth, AIRequestController.create);
router.get('/:id', auth, AIRequestController.get);
router.get('/', auth, AIRequestController.list);
router.delete('/:id', auth, AIRequestController.remove);

module.exports = router;
