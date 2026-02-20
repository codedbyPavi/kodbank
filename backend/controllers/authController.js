const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '1h';

async function register(req, res) {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO KodUser (username, email, password, phone, role) VALUES (?, ?, ?, ?, 'customer')`,
      [username, email || null, hashedPassword, phone || null]
    );
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login.',
      redirect: '/login',
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const [rows] = await pool.query(
      'SELECT uid, username, password, role FROM KodUser WHERE username = ?',
      [username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    const payload = { username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('INSERT INTO UserToken (token, uid, expiry) VALUES (?, ?, ?)', [
      token,
      user.uid,
      expiry,
    ]);
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 60 * 60 * 1000,
    });
    res.json({
      success: true,
      message: 'Login successful',
      redirect: '/dashboard',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
}

function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  res.json({ success: true, message: 'Logged out' });
}

module.exports = { register, login, logout };
