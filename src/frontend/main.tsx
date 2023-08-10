import React from 'react'
import ReactDOM from 'react-dom/client'
import HomePage from './HomePage.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage playerColor={ Date.now() % 2 == 0 ? "w" : "w"} />
  </React.StrictMode>,
)
