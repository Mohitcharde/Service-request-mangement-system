const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../validators/authValidator');

router.post('/register', validateRegisterInput, register);
router.post('/login', validateLoginInput, login);
router.get('/me', authenticate, getMe);

module.exports = router;
