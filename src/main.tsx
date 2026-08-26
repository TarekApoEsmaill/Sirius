import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { AppProvider } from '@/contexts/AppContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { WarehouseProvider } from '@/contexts/WarehouseContext';
import { ToastProvider } from '@/components/ui/Toast';
import '@/styles/globals.css';
import App from './App';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <RoleProvider>
          <AppProvider>
            <StoreProvider>
              <WarehouseProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </WarehouseProvider>
            </StoreProvider>
          </AppProvider>
        </RoleProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
