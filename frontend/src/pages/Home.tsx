import React, { useEffect, useState } from 'react';
import { devicesAPI, heartbeatsAPI } from '../services/api';
import { Device, Heartbeat } from '../types';

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [recentHeartbeats, setRecentHeartbeats] = useState<Heartbeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    avgCpu: 0,
    avgTemperature: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [devicesData, heartbeatsData] = await Promise.all([
        devicesAPI.getAll(),
        heartbeatsAPI.getAll({ limit: 10 })
      ]);

      setDevices(devicesData);
      setRecentHeartbeats(heartbeatsData);

      // Calculate stats
      const onlineDevices = heartbeatsData
        .filter(h => h.connectivity === 1)
        .map(h => h.device_sn)
        .filter((sn, index, self) => self.indexOf(sn) === index)
        .length;

      const avgCpu = heartbeatsData.length > 0 
        ? heartbeatsData.reduce((sum, h) => sum + h.cpu, 0) / heartbeatsData.length
        : 0;

      const avgTemperature = heartbeatsData.length > 0
        ? heartbeatsData.reduce((sum, h) => sum + h.temperature, 0) / heartbeatsData.length
        : 0;

      setStats({
        totalDevices: devicesData.length,
        onlineDevices,
        avgCpu: Math.round(avgCpu * 10) / 10,
        avgTemperature: Math.round(avgTemperature * 10) / 10,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="page-header">
        <h1>🏠 Dashboard Principal</h1>
        <p>Visão geral do sistema de telemetria IoT</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>Total de Dispositivos</h3>
            <p className="stat-number">{stats.totalDevices}</p>
          </div>
        </div>

        <div className="stat-card online">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Dispositivos Online</h3>
            <p className="stat-number">{stats.onlineDevices}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>CPU Média</h3>
            <p className="stat-number">{stats.avgCpu}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌡️</div>
          <div className="stat-content">
            <h3>Temperatura Média</h3>
            <p className="stat-number">{stats.avgTemperature}°C</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card">
          <h2>📋 Dispositivos Recentes</h2>
          <div className="devices-list">
            {devices.slice(0, 5).map(device => (
              <div key={device.id} className="device-item">
                <div className="device-info">
                  <span className="device-name">{device.name}</span>
                  <span className="device-sn">SN: {device.sn}</span>
                </div>
                <div className="device-location">{device.location}</div>
              </div>
            ))}
            {devices.length === 0 && (
              <p className="no-data">Nenhum dispositivo cadastrado</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2>💓 Heartbeats Recentes</h2>
          <div className="heartbeats-list">
            {recentHeartbeats.slice(0, 5).map(heartbeat => (
              <div key={heartbeat.id} className="heartbeat-item">
                <div className="heartbeat-device">
                  <span className="device-sn">{heartbeat.device_sn}</span>
                  <span className="heartbeat-time">
                    {new Date(heartbeat.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="heartbeat-metrics">
                  <span className="metric">CPU: {heartbeat.cpu}%</span>
                  <span className="metric">RAM: {heartbeat.ram}%</span>
                  <span className="metric">Temp: {heartbeat.temperature}°C</span>
                  <span className={`connectivity ${heartbeat.connectivity ? 'online' : 'offline'}`}>
                    {heartbeat.connectivity ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </div>
            ))}
            {recentHeartbeats.length === 0 && (
              <p className="no-data">Nenhum heartbeat recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
