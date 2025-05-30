// src/routes/audioLogRoutes.js
const express = require('express');
const AudioLogController = require('../Controllers/audioLogController');
const auth = require('../Middleware/AuthToken'); // JWT middleware
const router = express.Router();

/** -----------------------------------------
 *  /api/audio-logs
 *  ----------------------------------------*/
router.post('/', auth, AudioLogController.create);
router.get('/:id', auth, AudioLogController.get);
router.get('/', auth, AudioLogController.list);
router.delete('/:id', auth, AudioLogController.remove);

module.exports = router;
