const express = require('express');
const router = express.Router();
const UserCtl = require('../Controllers/UserController');
const userAuthController = require('../Controllers/UserAuthController'); 
const auth = require('../Middleware/AuthToken'); // JWT middleware

const {
  createUserValidation,
  patchUsernameValidation,
  patchEmailValidation,
} = require('../Validators/UserValidator');


// ───── PUBLIC ─────
router.post('/auth/login', userAuthController); 

// ───── AUTHENTICATED ─────

// READ
router.get('/', auth, UserCtl.list);
router.get('/:id', auth, UserCtl.get);

// CREATE
router.post('/', createUserValidation, UserCtl.create);

// PATCH (PARTIAL UPDATES)
router.patch('/:id/username', auth, patchUsernameValidation, UserCtl.patchUsername);
router.patch('/:id/email', auth, patchEmailValidation, UserCtl.patchEmail);
router.patch('/:id/password', auth, UserCtl.patchPassword);

// DELETE
router.delete('/:id', auth, UserCtl.remove);

module.exports = router;
