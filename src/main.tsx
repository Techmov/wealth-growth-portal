
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Set the base URL for the application
const baseUrl = document.getElementsByTagName('base')[0]?.getAttribute('href') || '/';

// Find the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found in the document. Make sure there's an element with id 'root' in your HTML.");
}

// Render the application
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
