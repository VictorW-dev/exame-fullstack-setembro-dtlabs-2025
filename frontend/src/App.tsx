import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import GuardedRoute from './components/GuardedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Devices from './pages/Devices';
import DeviceCrud from './pages/DeviceCrud';
import Notifications from './pages/Notifications';
import DeviceDetail from './pages/DeviceDetail';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <GuardedRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </GuardedRoute>
              } />
              <Route path="/devices" element={
                <GuardedRoute>
                  <Layout>
                    <Devices />
                  </Layout>
                </GuardedRoute>
              } />
              <Route path="/devices/new" element={
                <GuardedRoute>
                  <Layout>
                    <DeviceCrud />
                  </Layout>
                </GuardedRoute>
              } />
              <Route path="/devices/:id/edit" element={
                <GuardedRoute>
                  <Layout>
                    <DeviceCrud />
                  </Layout>
                </GuardedRoute>
              } />
              <Route path="/devices/:id" element={
                <GuardedRoute>
                  <Layout>
                    <DeviceDetail />
                  </Layout>
                </GuardedRoute>
              } />
              <Route path="/notifications" element={
                <GuardedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </GuardedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
