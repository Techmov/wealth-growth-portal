
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set the base URL for the application
const baseUrl = document.getElementsByTagName('base')[0]?.getAttribute('href') || '/';

createRoot(document.getElementById("root")!).render(<App />);
