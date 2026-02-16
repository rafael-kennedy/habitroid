import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { exportState, importState } from './services/stateFile'

// Expose state management for automation
declare global {
  interface Window {
    HabitroidState: {
      exportState: () => Promise<string>;
      importState: (json: string) => Promise<void>;
    }
  }
}

window.HabitroidState = {
  exportState,
  importState
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
