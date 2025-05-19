
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Função para aplicar as configurações de tema salvas
const applyStoredThemeSettings = () => {
  const savedSettings = localStorage.getItem('themeSettings');
  
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      
      // Aplicar configurações básicas
      document.title = settings.siteName || 'CALENDÁRIO DE EVENTOS - MKT';
      
      // Aplicar cores personalizadas (se existirem)
      if (settings.primaryColor) {
        const convertHexToHSL = (hex: string) => {
          hex = hex.replace('#', '');
          
          let r = parseInt(hex.substr(0, 2), 16) / 255;
          let g = parseInt(hex.substr(2, 2), 16) / 255;
          let b = parseInt(hex.substr(4, 2), 16) / 255;
          
          let max = Math.max(r, g, b);
          let min = Math.min(r, g, b);
          let h = 0, s = 0, l = (max + min) / 2;
          
          if (max !== min) {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            
            h *= 60;
          }
          
          return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
        };
        
        // Aplicar variáveis CSS
        const primaryHSL = convertHexToHSL(settings.primaryColor);
        const secondaryHSL = convertHexToHSL(settings.secondaryColor);
        const accentHSL = convertHexToHSL(settings.accentColor);
        
        document.documentElement.style.setProperty('--primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
        document.documentElement.style.setProperty('--secondary', `${secondaryHSL.h} ${secondaryHSL.s}% ${secondaryHSL.l}%`);
        document.documentElement.style.setProperty('--accent', `${accentHSL.h} ${accentHSL.s}% ${accentHSL.l}%`);
        
        // Aplicar fonte personalizada
        if (settings.fontFamily) {
          document.body.style.fontFamily = settings.fontFamily;
        }
      }
    } catch (error) {
      console.error('Error applying theme settings:', error);
    }
  } else {
    // Set default title if no settings exist
    document.title = 'CALENDÁRIO DE EVENTOS - MKT';
  }
};

// Aplicar configurações de tema antes de renderizar a aplicação
applyStoredThemeSettings();

// Renderizar a aplicação
createRoot(document.getElementById("root")!).render(<App />);
