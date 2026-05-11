import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './App'

const root = document.getElementById('whiteboard-root')

if (!root) {
  throw new Error('Missing #whiteboard-root')
}

createRoot(root).render(<App />)
