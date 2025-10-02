import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { devicesAPI } from '../services/api';
import { Device } from '../types';

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const data = await devicesAPI.getAll();
      setDevices(data);
    } catch (error: any) {
      setError('Erro ao carregar dispositivos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este dispositivo?')) {
      try {
        await devicesAPI.delete(id);
        setDevices(devices.filter(d => d.id !== id));
      } catch (error) {
        alert('Erro ao deletar dispositivo');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dispositivos...</p>
      </div>
    );
  }

  return (
    <div className="devices-container">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>📱 Dispositivos IoT</h1>
            <p>Gerencie seus dispositivos de telemetria</p>
          </div>
          <Link to="/devices/new" className="btn btn-primary">
            ➕ Novo Dispositivo
          </Link>
        </div>
      </header>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <div className="devices-grid">
        {devices.map(device => (
          <div key={device.id} className="device-card">
            <div className="device-header">
              <h3>{device.name}</h3>
              <span className="device-sn">SN: {device.sn}</span>
            </div>
            
            <div className="device-info">
              <p><strong>📍 Local:</strong> {device.location}</p>
              {device.description && (
                <p><strong>📝 Descrição:</strong> {device.description}</p>
              )}
              <p><strong>📅 Criado:</strong> {new Date(device.created_at).toLocaleDateString('pt-BR')}</p>
              {device.last_heartbeat && (
                <p><strong>💓 Último heartbeat:</strong> {new Date(device.last_heartbeat).toLocaleString('pt-BR')}</p>
              )}
            </div>

            <div className="device-actions">
              <Link to={`/devices/${device.id}`} className="btn btn-secondary">
                👁️ Ver Detalhes
              </Link>
              <Link to={`/devices/${device.id}/edit`} className="btn btn-outline">
                ✏️ Editar
              </Link>
              <button 
                onClick={() => handleDelete(device.id)}
                className="btn btn-danger"
              >
                🗑️ Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {devices.length === 0 && !loading && (
        <div className="empty-state">
          <h3>📱 Nenhum dispositivo cadastrado</h3>
          <p>Comece criando seu primeiro dispositivo IoT</p>
          <Link to="/devices/new" className="btn btn-primary">
            ➕ Criar Primeiro Dispositivo
          </Link>
        </div>
      )}
    </div>
  );
}
