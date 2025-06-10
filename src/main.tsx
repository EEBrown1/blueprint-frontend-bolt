import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  rootElement.innerHTML = `
    <div class="error-page">
      <h1>Something went wrong</h1>
      <p>We're having trouble loading the application. Please try refreshing the page.</p>
      <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}