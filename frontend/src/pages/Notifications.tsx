import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Notification, NotificationRule } from '../types';

export default function Notifications() {
  const { user } = useAuth();
  const { notifications: realtimeNotifications, clearNotifications } = useNotifications();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [storedNotifications, setStoredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for creating rules
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    condition: '',
    device_sns: '',
    scope: 'user' as 'user' | 'global'
  });

  useEffect(() => {
    if (user) {
      loadNotificationData();
    }
  }, [user]);

  const loadNotificationData = async () => {
    if (!user) return;
    
    try {
      const [rulesData, notificationsData] = await Promise.all([
        notificationsAPI.getRules(user.id),
        notificationsAPI.getNotifications(user.id)
      ]);
      
      setRules(rulesData);
      setStoredNotifications(notificationsData);
    } catch (error: any) {
      setError('Erro ao carregar notificações');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const newRule = await notificationsAPI.createRule({
        ...formData,
        user_id: user.id
      });
      
      setRules(prev => [...prev, newRule]);
      setFormData({
        name: '',
        condition: '',
        device_sns: '',
        scope: 'user'
      });
      setShowRuleForm(false);
    } catch (error: any) {
      setError('Erro ao criar regra de notificação');
      console.error(error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      await notificationsAPI.deleteRule(ruleId);
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (error: any) {
      setError('Erro ao excluir regra');
      console.error(error);
    }
  };

  const allNotifications = [
    ...realtimeNotifications,
    ...storedNotifications
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando notificações...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>🔔 Notificações</h1>
            <p>Sistema de alertas e notificações em tempo real</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowRuleForm(!showRuleForm)}
              className="btn btn-primary"
            >
              ➕ Nova Regra
            </button>
            {realtimeNotifications.length > 0 && (
              <button onClick={clearNotifications} className="btn btn-outline">
                🗑️ Limpar ({realtimeNotifications.length})
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          ❌ {error}
          <button onClick={() => setError('')} className="close-btn">✕</button>
        </div>
      )}

      <div className="notifications-content">
        {/* Real-time Status */}
        <div className="card">
          <h2>📡 Status de Conexão</h2>
          <div className="connection-status">
            <div className="status-indicator online">
              <span className="status-dot"></span>
              WebSocket conectado - Recebendo notificações em tempo real
            </div>
            {realtimeNotifications.length > 0 && (
              <p className="notification-count">
                {realtimeNotifications.length} notificação(ões) não lida(s)
              </p>
            )}
          </div>
        </div>

        {/* Create Rule Form */}
        {showRuleForm && (
          <div className="card">
            <h2>➕ Criar Nova Regra</h2>
            <form onSubmit={handleCreateRule} className="rule-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome da Regra</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: CPU Alta"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="scope">Escopo</label>
                  <select
                    id="scope"
                    value={formData.scope}
                    onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value as 'user' | 'global' }))}
                  >
                    <option value="user">Usuário</option>
                    <option value="global">Global</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="condition">Condição</label>
                <input
                  id="condition"
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="Ex: cpu_usage > 80"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="device_sns">Dispositivos (Serial Numbers)</label>
                <input
                  id="device_sns"
                  type="text"
                  value={formData.device_sns}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_sns: e.target.value }))}
                  placeholder="Ex: DEV001,DEV002 ou deixe vazio para todos"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Criar Regra
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowRuleForm(false)}
                  className="btn btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Rules */}
        <div className="card">
          <h2>⚙️ Regras de Notificação ({rules.length})</h2>
          {rules.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma regra de notificação configurada</p>
              <p className="text-small">Clique em "Nova Regra" para criar sua primeira regra</p>
            </div>
          ) : (
            <div className="rules-list">
              {rules.map(rule => (
                <div key={rule.id} className="rule-item">
                  <div className="rule-header">
                    <h3>{rule.name}</h3>
                    <div className="rule-actions">
                      <span className={`rule-scope ${rule.scope}`}>{rule.scope}</span>
                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="btn btn-danger btn-small"
                        title="Excluir regra"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="rule-details">
                    <p><strong>Condição:</strong> {rule.condition}</p>
                    <p><strong>Dispositivos:</strong> {rule.device_sns || 'Todos'}</p>
                    <p><strong>Criado:</strong> {new Date(rule.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="card">
          <h2>📋 Histórico de Notificações ({allNotifications.length})</h2>
          {allNotifications.length === 0 ? (
            <div className="empty-state">
              <h3>🔕 Nenhuma notificação</h3>
              <p>Você não possui notificações no momento</p>
              <p className="text-small">As notificações aparecerão aqui quando as regras forem acionadas</p>
            </div>
          ) : (
            <div className="notifications-list">
              {allNotifications.slice(0, 100).map((notification, index) => (
                <div 
                  key={`${notification.id}-${index}`} 
                  className={`notification-item ${realtimeNotifications.includes(notification) ? 'realtime' : ''}`}
                >
                  <div className="notification-header">
                    <span className="device-sn">📱 {notification.device_sn}</span>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="notification-content">
                    {typeof notification.payload === 'string' ? (
                      <p>{notification.payload}</p>
                    ) : (
                      <div className="notification-payload">
                        <strong>Dados:</strong>
                        <pre>{JSON.stringify(notification.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  {realtimeNotifications.includes(notification) && (
                    <div className="notification-badge">
                      ✨ Nova
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="card info-card">
          <h2>ℹ️ Informações do Sistema</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Usuário:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Total de Regras:</label>
              <span>{rules.length}</span>
            </div>
            <div className="info-item">
              <label>Notificações em Tempo Real:</label>
              <span>{realtimeNotifications.length}</span>
            </div>
            <div className="info-item">
              <label>Notificações Armazenadas:</label>
              <span>{storedNotifications.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
