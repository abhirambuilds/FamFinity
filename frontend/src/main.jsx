import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Cleanup service workers and caches in production to avoid stale asset 404s
if (import.meta.env.PROD) {
  import("./sw-cleanup.js").then(m => m.cleanupServiceWorkersAndCaches());
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
