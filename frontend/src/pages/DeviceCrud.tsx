import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { devicesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Device, CreateDeviceRequest, UpdateDeviceRequest } from '../types';

export default function DeviceCrud() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    sn: '',
    name: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadDevice(id);
    }
  }, [id, isEditing]);

  const loadDevice = async (deviceId: string) => {
    try {
      setLoading(true);
      const device = await devicesAPI.getById(deviceId);
      setFormData({
        sn: device.sn,
        name: device.name,
        location: device.location,
        description: device.description || '',
      });
    } catch (error) {
      setError('Erro ao carregar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing && id) {
        const updateData: UpdateDeviceRequest = {
          name: formData.name,
          location: formData.location,
          description: formData.description || undefined,
        };
        await devicesAPI.update(id, updateData);
      } else {
        const createData: CreateDeviceRequest = {
          sn: formData.sn,
          name: formData.name,
          location: formData.location,
          description: formData.description || undefined,
          user_id: user.id,
        };
        await devicesAPI.create(createData);
      }
      navigate('/devices');
    } catch (error: any) {
      setError(error.response?.data?.detail || `Erro ao ${isEditing ? 'atualizar' : 'criar'} dispositivo`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && isEditing) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando dispositivo...</p>
      </div>
    );
  }

  return (
    <div className="device-crud-container">
      <header className="page-header">
        <h1>{isEditing ? '✏️ Editar Dispositivo' : '➕ Novo Dispositivo'}</h1>
        <p>{isEditing ? 'Atualize as informações do dispositivo' : 'Cadastre um novo dispositivo IoT'}</p>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="device-form">
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="sn">🔖 Serial Number (SN)</label>
            <input
              id="sn"
              name="sn"
              type="text"
              value={formData.sn}
              onChange={handleChange}
              placeholder="Ex: DEV001"
              required
              disabled={isEditing} // SN não pode ser alterado
            />
            {isEditing && (
              <small className="form-help">O Serial Number não pode ser alterado</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">📱 Nome do Dispositivo</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Sensor de Temperatura Lab A"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">📍 Localização</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Laboratório A - Sala 101"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">📝 Descrição (Opcional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o dispositivo, sua função, especificações..."
              rows={4}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/devices')}
              className="btn btn-outline"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading 
                ? '⏳ Salvando...' 
                : isEditing 
                  ? '💾 Atualizar Dispositivo' 
                  : '➕ Criar Dispositivo'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
