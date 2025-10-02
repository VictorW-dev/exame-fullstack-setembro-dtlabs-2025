import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">🔗 IoT Telemetry</h1>
          <p className="login-subtitle">Acesse o dashboard de telemetria</p>
        </div>

        <div className="login-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                ❌ {error}
                <button 
                  type="button" 
                  onClick={() => setError('')} 
                  className="close-btn"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">📧 Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">🔒 Senha</label>
              <input
                id="password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large w-full"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Carregando...
                </>
              ) : (
                '🚪 Entrar'
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: '#374151' }}>
              🔧 Credenciais padrão:
            </p>
            <p style={{ margin: 0, color: '#6b7280' }}>
              <strong>Email:</strong> admin@demo.com<br />
              <strong>Senha:</strong> admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
