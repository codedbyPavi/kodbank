require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { initDb, pool } = require('./db');
const authRoutes = require('./routes/auth');
const balanceRoutes = require('./routes/balance');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(
  cors({
    origin: isProduction
      ? [process.env.FRONTEND_URL].filter(Boolean)
      : true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', balanceRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

async function start() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connected');
    
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Kodbank API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    if (err.code) {
      console.error('Error code:', err.code);
    }
    if (err.sqlMessage) {
      console.error('SQL error:', err.sqlMessage);
    }
    if (err.errno) {
      console.error('Error number:', err.errno);
    }
    process.exit(1);
  }
}

start();
