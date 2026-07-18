import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { CompetitorId } from './data/comparisons';
import { Versus } from './pages/Versus';
import './styles.css';

const competitorId = (document.body.dataset.competitor ?? 'duolingo') as CompetitorId;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Versus competitorId={competitorId} />
  </StrictMode>
);
