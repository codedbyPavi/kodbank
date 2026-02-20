import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { api } from '../api/axios';
import Button from '../components/Button';
import { animateCounter } from '../utils/animateCounter';
import './Dashboard.css';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract username from JWT token stored in cookie (we'll get it from balance response)
    // For now, we'll fetch it when balance is loaded
  }, []);

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
        
        // Animate counter
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-content fade-in">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              {username ? `Welcome back, ${username}!` : 'Welcome back!'}
            </h1>
            <p className="dashboard-subtitle">Manage your finances with ease</p>
          </div>
        </div>

        <div className="balance-section">
          <Button
            onClick={checkBalance}
            loading={loading}
            disabled={loading}
            className="balance-button"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            <span>{loading ? 'Loading...' : 'Check Balance'}</span>
          </Button>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {balance !== null && (
            <div className="balance-card scale-in">
              <div className="balance-card-header">
                <div className="balance-icon">
                  <FiDollarSign />
                </div>
                <div className="balance-label">Account Balance</div>
              </div>
              <div className="balance-amount">
                <span className="currency">₹</span>
                <span className="amount">{formatBalance(displayBalance)}</span>
              </div>
              <div className="balance-footer">
                <span className="balance-status">Active Account</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
