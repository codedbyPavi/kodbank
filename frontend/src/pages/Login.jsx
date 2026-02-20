import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import Input from '../components/Input';
import Button from '../components/Button';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/login', { username, password });
      if (data.success && data.redirect) {
        navigate(data.redirect);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon-large">K</span>
            <h1>Kodbank</h1>
          </div>
          <p className="auth-subtitle">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="Enter your username"
            required
            autoComplete="username"
            error={error && error.includes('username') ? error : ''}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            error={error && error.includes('password') ? error : ''}
          />

          {error && !error.includes('username') && !error.includes('password') && (
            <div className="error-message">{error}</div>
          )}

          <Button type="submit" loading={loading} fullWidth>
            Sign In
          </Button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
