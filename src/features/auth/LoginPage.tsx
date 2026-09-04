import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginApi } from '../../api/auth.api';
import { Crown, Key, Mail, AlertTriangle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginApi(email, password);
      if (res.success) {
        login(res.data.user, res.data.token, res.data.refreshToken);
        
        // Redirect based on normalized role
        const role = res.data.user.role.toLowerCase();
        if (role === 'admin' || role === 'manager') {
          navigate('/dashboard');
        } else if (role === 'chef' || role === 'kitchen') {
          navigate('/kds');
        } else if (role === 'cashier') {
          navigate('/pos');
        } else {
          navigate('/pos'); // Waiter goes to POS / table order
        }
      } else {
        setError(res.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };


  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('123456');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, rgba(30, 144, 255, 0.12) 0%, #f0f4f9 80%)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem',
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(30, 144, 255, 0.06)',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent-color), #54a5ff)',
            padding: '0.8rem',
            borderRadius: '16px',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(30, 144, 255, 0.3)'
          }}>
            <Crown size={32} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '1px', margin: '0 0 0.5rem 0' }}>
            Hures POS
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hệ thống quản trị kinh doanh & POS nhà hàng
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 77, 77, 0.15)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '12px',
            padding: '0.8rem 1rem',
            marginBottom: '1.5rem',
            color: '#ff8a8a',
            fontSize: '0.85rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email tài khoản</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                className="form-input"
                placeholder="ten@nhahang.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '1rem'
            }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem'
        }}>
          <span style={{
            display: 'block',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.8rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 700
          }}>
            Tài khoản dùng thử (Mật khẩu: 123456)
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.6rem'
          }}>
            {[
              { email: 'admin@restaurant.com', label: '👑 Admin' },
              { email: 'manager@restaurant.com', label: '💼 Manager' },
              { email: 'cashier@restaurant.com', label: '💵 Cashier' },
              { email: 'chef@restaurant.com', label: '🍳 Chef' },
              { email: 'waiter@restaurant.com', label: '🤵 Waiter' },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillCredentials(acc.email)}
                style={{
                  background: 'rgba(30, 144, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.6rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.background = 'rgba(30, 144, 255, 0.12)';
                  e.currentTarget.style.color = 'var(--accent-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'rgba(30, 144, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

