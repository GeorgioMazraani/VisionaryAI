/**
 * User-related validation chains (Express-Validator)
 * --------------------------------------------------
 *  ▸ createUserValidation     – for POST /api/users
 *  ▸ patchUsernameValidation  – for PATCH /api/users/:id/username
 *  ▸ patchEmailValidation     – for PATCH /api/users/:id/email
 *  ▸ patchPasswordValidation  – for PATCH /api/users/:id/password
 *
 *  Each validation chain:
 *    • trims / escapes basic input
 *    • adds descriptive error messages
 *    • ensures only the required fields are validated
 */

const { body } = require('express-validator');

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */

const usernameRule = body('username')
  .trim()
  .notEmpty().withMessage('Username is required')
  .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
  .matches(/^[\w.-]+$/).withMessage('Username may contain letters, numbers, underscores, dot, dash');

const emailRule = body('email')
  .trim()
  .normalizeEmail()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Must be a valid email address');

const passwordRule = fieldName =>
  body(fieldName)
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password needs a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password needs an uppercase letter')
    .matches(/\d/).withMessage('Password needs a number');

/* ────────────────────────────────────────────────────────────
   Public chains
   ──────────────────────────────────────────────────────────── */

/** POST /api/users  */
const createUserValidation = [
  usernameRule,
  emailRule,
  passwordRule('password'),
];

/** PATCH /api/users/:id/username */
const patchUsernameValidation = [
  usernameRule,
];

/** PATCH /api/users/:id/email */
const patchEmailValidation = [
  emailRule,
];

/** PATCH /api/users/:id/password */
const patchPasswordValidation = [
  passwordRule('currentPassword')
    .withMessage('Current password is required'),
  passwordRule('newPassword')
    .withMessage('New password must meet complexity requirements'),
  // ensure new password ≠ current
  body('newPassword')
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('New password must differ from current password'),
];

module.exports = {
  createUserValidation,
  patchUsernameValidation,
  patchEmailValidation,
  patchPasswordValidation,
};
