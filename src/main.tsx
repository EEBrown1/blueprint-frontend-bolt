import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

console.log('Starting application...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

try {
  console.log('Creating root and rendering app...');
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
  console.log('Initial render complete');
} catch (error) {
  console.error('Failed to render application:', error);
  // Show error to user
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <h1 style="color: #EF4444; margin-bottom: 16px;">Something went wrong</h1>
      <p style="color: #374151; margin-bottom: 16px;">
        We're having trouble loading the application. Please try refreshing the page.
      </p>
      <pre style="
        background: #F3F4F6;
        padding: 16px;
        border-radius: 8px;
        max-width: 100%;
        overflow-x: auto;
        color: #374151;
      ">${error instanceof Error ? error.message : 'Unknown error'}</pre>
    </div>
  `;
}