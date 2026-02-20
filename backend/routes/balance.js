const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getBalance } = require('../controllers/balanceController');

const router = express.Router();
router.get('/balance', authMiddleware, getBalance);

module.exports = router;
