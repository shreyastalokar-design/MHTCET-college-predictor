import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Analytics } from "@vercel/analytics/react";

// Keep Render backend awake
const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
setInterval(() => fetch(`${API}/ping`).catch(() => {}), 10 * 60 * 1000);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)