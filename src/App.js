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
import JornadaForm from './components/Jornadas/JornadaForm'; // Nuevo
import JornadaList from './components/Jornadas/JornadaList'; // Nuevo
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Reporteria from './components/Reporteria/Reporteria';
import EmpleadosReporte from './components/Reporteria/EmpleadosReporte';
import PagosReporte from './components/Reporteria/PagosReporte';
import JornadasReporte from './components/Reporteria/JornadasReporte'; // Nuevo
import FincasReporte from './components/Reporteria/FincasReporte';

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
            <Route path="/reporteria/fincas" element={<ProtectedRoute><FincasReporte /></ProtectedRoute>} />
            
            {/* Asignaciones */}
            <Route path="/asignaciones" element={<ProtectedRoute><AsignacionList /></ProtectedRoute>} />
            <Route path="/asignaciones/nueva" element={<ProtectedRoute><AsignacionForm /></ProtectedRoute>} />
            
            {/* Pagos */}
            <Route path="/pagos" element={<ProtectedRoute><PagoList /></ProtectedRoute>} />
            <Route path="/pagos/nuevo" element={<ProtectedRoute><PagoForm /></ProtectedRoute>} />
            
            {/* Jornadas - Nuevo módulo */}
            <Route path="/jornadas" element={<ProtectedRoute><JornadaList /></ProtectedRoute>} />
            <Route path="/jornadas/nueva" element={<ProtectedRoute><JornadaForm /></ProtectedRoute>} />
            <Route path="/jornadas/editar/:id" element={<ProtectedRoute><JornadaForm isEditMode={true} /></ProtectedRoute>} />
            
            {/* Reportería */}
            <Route path="/reporteria" element={<ProtectedRoute><Reporteria /></ProtectedRoute>} />
            <Route path="/reporteria/empleados" element={<ProtectedRoute><EmpleadosReporte /></ProtectedRoute>} />
            <Route path="/reporteria/pagos" element={<ProtectedRoute><PagosReporte /></ProtectedRoute>} />
            <Route path="/reporteria/jornadas" element={<ProtectedRoute><JornadasReporte /></ProtectedRoute>} /> {/* Nuevo */}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;