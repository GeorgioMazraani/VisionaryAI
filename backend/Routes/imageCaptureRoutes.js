// src/routes/imageCaptureRoutes.js
const express = require('express');
const upload = require('../Middleware/upload');          // same Multer config
const ImageCaptureController = require('../Controllers/imageCaptureController');
const auth = require('../Middleware/AuthToken'); // JWT middleware
const router = express.Router();

/** -----------------------------------------
 *  /api/image-captures
 *  ----------------------------------------*/
router.post('/', auth, upload.single('image'), ImageCaptureController.create);
router.get('/:id', auth, ImageCaptureController.get);
router.get('/', auth, ImageCaptureController.list);
router.delete('/:id', auth, ImageCaptureController.remove);

module.exports = router;
