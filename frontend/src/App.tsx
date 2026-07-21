import { Routes, Route } from "react-router-dom";

import LoginPage from "./views/auth/LoginPage";
import RegisterPage from "./views/auth/RegisterPage";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./routes/ProtectedRoute";
import { SocketProvider } from "./context/SocketContext";

// Socket REST authentication uses httpOnly cookies, so socket JWT token will require
// a dedicated token endpoint or a non-httpOnly cookie. Current code keeps token undefined
// until that flow is added.


export default function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </SocketProvider>
  );

}
