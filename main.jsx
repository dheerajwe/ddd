// main.jsx
// React application bootstrap file. Renders the App component into the DOM.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Keep StrictMode for development checks
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

