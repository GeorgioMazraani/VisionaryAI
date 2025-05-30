// src/routes/detectionRoutes.js
const express = require('express');
const DetectionController = require('../Controllers/detectionController');
const auth = require('../Middleware/AuthToken'); // JWT middleware
const router = express.Router();

/** -----------------------------------------
 *  /api/detections
 *  ----------------------------------------*/
router.post('/', auth, DetectionController.create);  // single or batch
router.get('/:id', auth, DetectionController.get);
router.get('/', auth, DetectionController.list);
router.delete('/:id', auth, DetectionController.remove);

module.exports = router;
