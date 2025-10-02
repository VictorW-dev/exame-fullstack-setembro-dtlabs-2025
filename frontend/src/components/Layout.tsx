import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { notifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePage = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/devices', label: 'Dispositivos', icon: '📱' },
    { 
      path: '/notifications', 
      label: 'Notificações', 
      icon: '🔔',
      badge: notifications.length > 0 ? notifications.length : undefined
    },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2 className="nav-brand">🚀 IoT Monitor</h2>
          <p className="text-small">Sistema de Telemetria</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={isActivePage(item.path) ? 'active' : ''}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="notification-badge">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{user?.name || 'Usuário'}</strong>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
              {user?.email}
            </div>
            <button onClick={handleLogout} className="btn btn-outline btn-small" style={{ width: '100%' }}>
              🚪 Sair
            </button>
          </div>
        </div>
      </aside>
      
      <main className="main-content">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
