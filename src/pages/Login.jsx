import axios from 'axios';
import { Lock, Moon, ShieldCheck, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');
  const navigate = useNavigate();

  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button
        className="login-theme-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="login-card glass-card fade-in">
        <div className="login-header">
          <div className="logo-icon">
            <ShieldCheck size={40} color="#6366f1" />
          </div>
          <h1>Admin Portal</h1>
          <p>Sign in to manage your system</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div className="error-msg">{error}</div>}

          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; 2026 AdminApp Pro. Secure Access.</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: var(--bg-dark);
          position: relative;
        }
        .login-theme-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 10px;
          border-radius: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          cursor: pointer;
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          background: var(--bg-card);
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo-icon {
          background: rgba(99, 102, 241, 0.1);
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        .login-header h1 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .login-header p {
          color: var(--text-muted);
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-wrapper input {
          width: 100%;
          padding-left: 45px !important;
        }
        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-align: center;
        }
        .w-full { width: 100%; }
        .login-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Login;
