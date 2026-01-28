import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

// Primjena teme prije prvog renderiranja (smanjuje bljesak)
const stored = localStorage.getItem('ai-catalog-theme')
const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
if (dark) document.documentElement.classList.add('dark')
else document.documentElement.classList.remove('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
