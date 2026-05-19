import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'

// Configure axios base URL for production
if (import.meta.env.PROD) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
