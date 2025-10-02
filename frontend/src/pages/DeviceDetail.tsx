import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { devicesAPI, heartbeatsAPI } from '../services/api';
import { Device, Heartbeat } from '../types';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [heartbeats, setHeartbeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadDeviceDetails(id);
    }
  }, [id]);

  const loadDeviceDetails = async (deviceId: string) => {
    try {
      const [deviceData, heartbeatsData] = await Promise.all([
        devicesAPI.getById(deviceId),
        heartbeatsAPI.getByDevice(deviceId, 20) // Get latest 20 heartbeats
      ]);
      
      setDevice(deviceData);
      setHeartbeats(heartbeatsData);
    } catch (error: any) {
      setError('Erro ao carregar detalhes do dispositivo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando detalhes do dispositivo...</p>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="error-container">
        <h1>❌ Erro</h1>
        <p>{error || 'Dispositivo não encontrado'}</p>
        <Link to="/devices" className="btn btn-primary">
          ← Voltar para Dispositivos
        </Link>
      </div>
    );
  }

  const latestHeartbeat = heartbeats[0];
  const isOnline = latestHeartbeat?.connectivity === 1;

  return (
    <div className="device-detail-container">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>📱 {device.name}</h1>
            <p>Detalhes e telemetria do dispositivo</p>
          </div>
          <div className="header-actions">
            <Link to={`/devices/${device.id}/edit`} className="btn btn-secondary">
              ✏️ Editar
            </Link>
            <Link to="/devices" className="btn btn-outline">
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      <div className="device-detail-content">
        {/* Device Info Card */}
        <div className="card device-info-card">
          <h2>ℹ️ Informações do Dispositivo</h2>
          <div className="device-info-grid">
            <div className="info-item">
              <label>Serial Number:</label>
              <span>{device.sn}</span>
            </div>
            <div className="info-item">
              <label>Nome:</label>
              <span>{device.name}</span>
            </div>
            <div className="info-item">
              <label>Localização:</label>
              <span>{device.location}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
            <div className="info-item">
              <label>Criado em:</label>
              <span>{new Date(device.created_at).toLocaleString('pt-BR')}</span>
            </div>
            {device.last_heartbeat && (
              <div className="info-item">
                <label>Último heartbeat:</label>
                <span>{new Date(device.last_heartbeat).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>
          {device.description && (
            <div className="device-description">
              <label>Descrição:</label>
              <p>{device.description}</p>
            </div>
          )}
        </div>

        {/* Latest Metrics Card */}
        {latestHeartbeat && (
          <div className="card metrics-card">
            <h2>📊 Métricas Atuais</h2>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">CPU</div>
                <div className="metric-value">{latestHeartbeat.cpu}%</div>
                <div className={`metric-bar ${getMetricStatus(latestHeartbeat.cpu, 80)}`}>
                  <div 
                    className="metric-fill" 
                    style={{ width: `${Math.min(latestHeartbeat.cpu, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">RAM</div>
                <div className="metric-value">{latestHeartbeat.ram}%</div>
                <div className={`metric-bar ${getMetricStatus(latestHeartbeat.ram, 85)}`}>
                  <div 
                    className="metric-fill" 
                    style={{ width: `${Math.min(latestHeartbeat.ram, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Disco Livre</div>
                <div className="metric-value">{latestHeartbeat.disk_free}%</div>
                <div className={`metric-bar ${getMetricStatus(100 - latestHeartbeat.disk_free, 80)}`}>
                  <div 
                    className="metric-fill" 
                    style={{ width: `${Math.min(100 - latestHeartbeat.disk_free, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Temperatura</div>
                <div className="metric-value">{latestHeartbeat.temperature}°C</div>
                <div className={`metric-bar ${getMetricStatus(latestHeartbeat.temperature, 70)}`}>
                  <div 
                    className="metric-fill" 
                    style={{ width: `${Math.min(latestHeartbeat.temperature, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Latência DNS</div>
                <div className="metric-value">{latestHeartbeat.dns_latency_ms}ms</div>
              </div>
              <div className="metric-item">
                <div className="metric-label">Boot Timestamp</div>
                <div className="metric-value">
                  {new Date(latestHeartbeat.boot_ts_utc).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heartbeats History */}
        <div className="card heartbeats-card">
          <h2>💓 Histórico de Heartbeats</h2>
          {heartbeats.length === 0 ? (
            <p className="no-data">Nenhum heartbeat registrado para este dispositivo</p>
          ) : (
            <div className="heartbeats-table">
              <div className="table-header">
                <span>Timestamp</span>
                <span>CPU</span>
                <span>RAM</span>
                <span>Temp</span>
                <span>Status</span>
              </div>
              {heartbeats.map(heartbeat => (
                <div key={heartbeat.id} className="table-row">
                  <span className="timestamp">
                    {new Date(heartbeat.created_at).toLocaleString('pt-BR')}
                  </span>
                  <span className="metric">{heartbeat.cpu}%</span>
                  <span className="metric">{heartbeat.ram}%</span>
                  <span className="metric">{heartbeat.temperature}°C</span>
                  <span className={`status ${heartbeat.connectivity ? 'online' : 'offline'}`}>
                    {heartbeat.connectivity ? '🟢' : '🔴'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getMetricStatus(value: number, threshold: number): string {
  if (value >= threshold) return 'critical';
  if (value >= threshold * 0.7) return 'warning';
  return 'normal';
}
