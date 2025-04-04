import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import DashboardChamadas from './pages/PainelChamadas';
import Chamador from './pages/Chamador';
import TotemAtendimento from './pages/TotemAtendimento';
import SelecionarMesa from './pages/SelecionarMesa';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const mesa = localStorage.getItem("mesa");

  // Se não houver uma mesa selecionada, redireciona para a seleção de mesa
  if (!mesa) {
    return <Navigate to="/selecionar-mesa" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/selecionar-mesa" element={<SelecionarMesa />} />
          <Route path="/painel-chamadas" element={<DashboardChamadas />} />
          <Route path="/totem-atendimento" element={<TotemAtendimento />} />
          <Route
            path="/chamador"
            element={
              <ProtectedRoute>
                <Chamador />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/selecionar-mesa" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
