import ReactDOM from "react-dom/client";
import App from "./routes/App.jsx";
// @ts-ignore: side-effect CSS import declaration not found
import "./styles/index.css";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SocketProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);
