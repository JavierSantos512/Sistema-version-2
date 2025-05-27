import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  MenuItem,
  Alert,
  AlertTitle
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

// Componentes estilizados
const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f5f5dc',
  minHeight: '100vh',
  padding: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff, #f8f4e5)',
  borderRadius: '16px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '500px',
  border: '1px solid #e0d6c2'
}));

const AnimatedButton = motion(Button);

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#d7ccc8',
    },
    '&:hover fieldset': {
      borderColor: '#a1887f',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8d6e63',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#5d4037',
  },
}));

const AsignacionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empleado_id: '',
    finca_id: '',
    descripcion: '',
    fecha_asignacion: new Date().toISOString().split('T')[0]
  });
  const [empleados, setEmpleados] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const [empleadosRes, fincasRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/empleados', { headers }),
          axios.get('http://127.0.0.1:5000/api/fincas', { headers })
        ]);

        setEmpleados(empleadosRes.data);
        setFincas(fincasRes.data);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/api/asignaciones',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccess('Asignación creada exitosamente');
        setFormData({ 
          empleado_id: '', 
          finca_id: '', 
          descripcion: '',
          fecha_asignacion: new Date().toISOString().split('T')[0]
        });
        setError('');
        setTimeout(() => navigate('/asignaciones'), 2000);
      } else {
        setError('Error al crear asignación');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al crear asignación');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
      setSuccess('');
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <StyledPaper elevation={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              color: '#5d4037',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            Asignar Empleado a Finca
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              mt: 1,
              width: '100%'
            }}
          >
            <StyledTextField
              select
              margin="normal"
              required
              fullWidth
              id="empleado_id"
              label="Empleado"
              name="empleado_id"
              value={formData.empleado_id}
              onChange={handleChange}
            >
              {empleados.map((empleado) => (
                <MenuItem 
                  key={empleado.id} 
                  value={empleado.id}
                  sx={{ '&:hover': { backgroundColor: '#f5f5dc' } }}
                >
                  {empleado.nombre} - {empleado.cedula}
                </MenuItem>
              ))}
            </StyledTextField>

            <StyledTextField
              select
              margin="normal"
              required
              fullWidth
              id="finca_id"
              label="Finca"
              name="finca_id"
              value={formData.finca_id}
              onChange={handleChange}
            >
              {fincas.map((finca) => (
                <MenuItem 
                  key={finca.id} 
                  value={finca.id}
                  sx={{ '&:hover': { backgroundColor: '#f5f5dc' } }}
                >
                  {finca.nombre} - {finca.ubicacion}
                </MenuItem>
              ))}
            </StyledTextField>

            <StyledTextField
              margin="normal"
              fullWidth
              id="fecha_asignacion"
              label="Fecha de Asignación"
              name="fecha_asignacion"
              type="date"
              value={formData.fecha_asignacion}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <StyledTextField
              margin="normal"
              fullWidth
              id="descripcion"
              label="Descripción (Opcional)"
              name="descripcion"
              multiline
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 3,
                  border: '1px solid #ef9a9a',
                  backgroundColor: '#ffebee'
                }}
              >
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mt: 3,
                  border: '1px solid #a5d6a7',
                  backgroundColor: '#e8f5e9'
                }}
              >
                <AlertTitle>Éxito</AlertTitle>
                {success}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <AnimatedButton
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#5d4037',
                  '&:hover': { backgroundColor: '#3e2723' }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Crear Asignación
              </AnimatedButton>
              <AnimatedButton
                fullWidth
                variant="outlined"
                sx={{
                  color: '#5d4037',
                  borderColor: '#5d4037',
                  '&:hover': { borderColor: '#3e2723' }
                }}
                onClick={() => navigate('/asignaciones')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </AnimatedButton>
            </Box>
          </Box>
        </Box>
      </StyledPaper>
    </StyledContainer>
  );
};

export default AsignacionForm;