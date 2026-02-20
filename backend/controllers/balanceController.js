const { pool } = require('../db');

async function getBalance(req, res) {
  try {
    const { username } = req.user;
    const [rows] = await pool.query(
      'SELECT balance FROM KodUser WHERE username = ?',
      [username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      balance: Number(user.balance),
      username: username,
    });
  } catch (err) {
    console.error('Balance error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch balance' });
  }
}

module.exports = { getBalance };
