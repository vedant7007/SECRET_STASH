/**
 * main.tsx
 *
 * Entry point to the Loveverse.
 * Where the code breathes life into emotion.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
