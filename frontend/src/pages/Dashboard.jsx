import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FiDollarSign, FiRefreshCw, FiTrendingUp, FiSave, FiActivity } from 'react-icons/fi';
import { api } from '../api/axios';
import Button from '../components/Button';
import Chatbot from '../components/Chatbot';
import { animateCounter } from '../utils/animateCounter';
import './Dashboard.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function fireConfetti() {
  const count = 120;
  const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
  function fire(particleRatio, opts) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
  }
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

const MOCK_SPENDING = 24500;
const MOCK_SAVINGS = 12000;
const MOCK_ACTIVITY_COUNT = 3;

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBalance = async () => {
    setLoading(true);
    setError('');
    setBalance(null);
    setDisplayBalance(0);

    try {
      const { data } = await api.get('/api/balance');
      if (data.success) {
        setBalance(data.balance);
        if (data.username) {
          setUsername(data.username);
        }
        fireConfetti();
        animateCounter(data.balance, 1500, (value) => {
          setDisplayBalance(value);
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError(err.response?.data?.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (n) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="dashboard-container">
      <div className="dashboard-shapes" aria-hidden="true">
        <div className="shape shape--1" />
        <div className="shape shape--2" />
        <div className="shape shape--3" />
      </div>

      <div className="dashboard-content fade-in">
        <div className="dashboard-welcome-card glass-card">
          <h1 className="dashboard-title">
            {getGreeting()}, {username || 'there'} 👋
          </h1>
          <p className="dashboard-subtitle">Manage your finances with ease</p>
        </div>

        <div className="dashboard-cards">
          <div className={`dashboard-card glass-card dashboard-card--balance ${balance !== null ? 'balance-reveal' : ''}`}>
            <div className="dashboard-card__header">
              <div className="dashboard-card__icon dashboard-card__icon--yellow">
                <FiDollarSign />
              </div>
              <span className="dashboard-card__label">Account Balance</span>
            </div>
            <div className="dashboard-card__value">
              {balance !== null ? (
                <>
                  <span className="currency">₹</span>
                  <span className="amount">{formatBalance(displayBalance)}</span>
                </>
              ) : (
                <span className="amount amount--placeholder">—</span>
              )}
            </div>
            <Button
              onClick={checkBalance}
              loading={loading}
              disabled={loading}
              className="balance-button btn-pill btn-primary"
            >
              <FiRefreshCw className={loading ? 'spinning' : ''} />
              <span>{loading ? 'Loading...' : 'Check Balance'}</span>
            </Button>
            {balance !== null && (
              <div className="balance-footer balance-footer--card">
                <span className="balance-status">Active Account</span>
              </div>
            )}
          </div>

          <div className="dashboard-card glass-card">
            <div className="dashboard-card__header">
              <div className="dashboard-card__icon">
                <FiTrendingUp />
              </div>
              <span className="dashboard-card__label">Monthly Spending</span>
            </div>
            <div className="dashboard-card__value">
              <span className="currency">₹</span>
              <span className="amount">{formatCurrency(MOCK_SPENDING)}</span>
            </div>
            <p className="dashboard-card__hint">This month</p>
          </div>

          <div className="dashboard-card glass-card">
            <div className="dashboard-card__header">
              <div className="dashboard-card__icon">
                <FiSave />
              </div>
              <span className="dashboard-card__label">Savings</span>
            </div>
            <div className="dashboard-card__value">
              <span className="currency">₹</span>
              <span className="amount">{formatCurrency(MOCK_SAVINGS)}</span>
            </div>
            <p className="dashboard-card__hint">Total saved</p>
          </div>

          <div className="dashboard-card glass-card">
            <div className="dashboard-card__header">
              <div className="dashboard-card__icon">
                <FiActivity />
              </div>
              <span className="dashboard-card__label">Activity</span>
            </div>
            <div className="dashboard-card__value">
              <span className="amount amount--activity">{MOCK_ACTIVITY_COUNT}</span>
              <span className="dashboard-card__suffix">transactions</span>
            </div>
            <p className="dashboard-card__hint">Last 7 days</p>
          </div>
        </div>

        {error && (
          <div className="error-message error-message--dashboard">{error}</div>
        )}
      </div>
      <Chatbot />
    </div>
  );
}
