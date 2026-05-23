import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ReactGA from 'react-ga4'
import { Analytics } from "@vercel/analytics/react"

// Google Analytics
ReactGA.initialize('G-L1HW2MW0LE')  // ← paste your ID here
ReactGA.send('pageview')

// Keep Render alive
const API = import.meta.env.VITE_API_URL || "http://localhost:8000"
setInterval(() => fetch(`${API}/ping`).catch(() => {}), 10 * 60 * 1000)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
)