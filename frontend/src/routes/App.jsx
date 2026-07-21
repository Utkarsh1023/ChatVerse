import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

import NotFoundPage from '../views/NotFoundPage.jsx';
import ProfilePage from '../component/Profile/ProfilePage.tsx';
import SettingsPage from '../component/Setting/SettingsPage.tsx';
import DashboardPage from '../pages/Dashboard.jsx';
import HomePage from '../pages/Home.tsx';
import Connection from '../pages/Connections.tsx';
import CallsPage from '../pages/Calls.tsx';
import Notification from '../pages/Notification.tsx';
import AuthPage from '../pages/AuthPage.tsx';
import LoginPage from '../views/auth/LoginPage.tsx';
import RegisterPage from '../views/auth/RegisterPage.tsx';


export default function App() {

  return (
    <>
      <Routes>
        {/* Ensure /dashboard/chats actually renders dashboard layout */}
        <Route path="/dashboard/chats" element={<DashboardPage />} />
        <Route path="/dashboard/connections" element={<Connection />} />
        <Route path="/dashboard/calls" element={<CallsPage />} />
        <Route path="/dashboard/notifications" element={<Notification />} />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Keep /dashboard as home dashboard */}
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* <ToastContainer position="top-right" autoClose={2500} /> */}
    </>
  );
}



