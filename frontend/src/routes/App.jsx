import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import NotFoundPage from '../views/NotFoundPage.jsx';
import ProfilePage from '../component/Profile/ProfilePage.tsx';
import SettingsPage from '../component/Setting/SettingsPage.tsx';
import DashboardPage from '../pages/Dashboard.jsx';
import HomePage from '../pages/Home.tsx';
import Connection from '../pages/Connections.tsx';
import Notification from '../pages/Notification.tsx';
import AuthPage from '../pages/AuthPage.tsx';
import LoginPage from '../views/auth/LoginPage.tsx';
import RegisterPage from '../views/auth/RegisterPage.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        {/* Public auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — single tree so the guard actually runs */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/dashboard/chats" element={<DashboardPage />} />
          <Route path="/dashboard/connections" element={<Connection />} />
          <Route path="/dashboard/notifications" element={<Notification />} />
          {/* /dashboard/profile/me → redirect to the logged-in user's profile */}
          <Route
            path="/dashboard/profile/me"
            element={
              <Navigate to={`/dashboard/profile/${user?.username || ""}`} replace />
            }
          />
          <Route path="/dashboard/profile/:username" element={<ProfilePage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

