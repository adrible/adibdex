import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getSiteLanguage } from './lib/language';

document.documentElement.lang = getSiteLanguage() === 'pt' ? 'pt-BR' : 'en';
createRoot(document.getElementById('root')!).render(<App />);
