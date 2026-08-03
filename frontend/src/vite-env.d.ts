/// <reference types="vite/client" />

// Side-effect CSS imports (e.g. react-toastify/dist/ReactToastify.css).
declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WS_URL?: string;
  readonly VITE_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

