import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EmpleadoForm from './components/Empleados/EmpleadoForm';
import EmpleadoList from './components/Empleados/EmpleadoList';
import FincaForm from './components/Fincas/FincaForm';
import FincaList from './components/Fincas/FincaList';
import AsignacionForm from './components/Asignaciones/AsignacionForm';
import AsignacionList from './components/Asignaciones/AsignacionList';
import PagoForm from './components/Pagos/PagoForm';
import PagoList from './components/Pagos/PagoList';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#795548',
    },
    secondary: {
      main: '#8d6e63',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><PagoList /></ProtectedRoute>} />
            
            {/* Empleados */}
            <Route path="/empleados" element={<ProtectedRoute><EmpleadoList /></ProtectedRoute>} />
            <Route path="/empleados/nuevo" element={<ProtectedRoute><EmpleadoForm /></ProtectedRoute>} />
            
            {/* Fincas */}
            <Route path="/fincas" element={<ProtectedRoute><FincaList /></ProtectedRoute>} />
            <Route path="/fincas/nueva" element={<ProtectedRoute><FincaForm /></ProtectedRoute>} />
            
            {/* Asignaciones */}
            <Route path="/asignaciones" element={<ProtectedRoute><AsignacionList /></ProtectedRoute>} />
            <Route path="/asignaciones/nueva" element={<ProtectedRoute><AsignacionForm /></ProtectedRoute>} />
            
            {/* Pagos */}
            <Route path="/pagos" element={<ProtectedRoute><PagoList /></ProtectedRoute>} />
            <Route path="/pagos/nuevo" element={<ProtectedRoute><PagoForm /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;