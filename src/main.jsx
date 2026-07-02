import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme-init';
import './global.css';
import Providers from './app/Providers.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found. Check index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
);
