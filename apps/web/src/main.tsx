import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { Landing } from './pages/Landing';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Landing />
    <Analytics />
  </StrictMode>
);
