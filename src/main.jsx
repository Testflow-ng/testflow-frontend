import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme-init';
import './global.css';
import Providers from './app/Providers.jsx';
import { runAppReset } from './appReset.js';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found. Check index.html.');
}

runAppReset().then((reloading) => {
  if (reloading) return;
  createRoot(rootElement).render(
    <StrictMode>
      <Providers />
    </StrictMode>,
  );
});
