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
  AlertTitle,
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

const PagoForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empleado_id: '',
    libras: '',
    precio_libra: '',
    total: '',
    fecha_pago: new Date().toISOString().split('T')[0]
  });
  const [empleados, setEmpleados] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios({
          method: 'get',
          url: 'http://127.0.0.1:5000/api/empleados',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        setEmpleados(response.data);
      } catch (error) {
        console.error('Error al cargar empleados:', error);
        setError('Error al cargar la lista de empleados');
      }
    };
    fetchEmpleados();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.empleado_id) {
      errors.empleado_id = 'Debe seleccionar un empleado';
    }
    if (!formData.libras || parseFloat(formData.libras) <= 0) {
      errors.libras = 'Las libras cortadas deben ser mayor que 0';
    }
    if (!formData.precio_libra || parseFloat(formData.precio_libra) <= 0) {
      errors.precio_libra = 'El precio por libra debe ser mayor que 0';
    }
    if (!formData.fecha_pago) {
      errors.fecha_pago = 'Debe seleccionar una fecha';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calcularPago = () => {
    if (!formData.libras || !formData.precio_libra) {
      setError('Debe ingresar las libras cortadas y el precio por libra');
      return;
    }
    const libras = parseFloat(formData.libras);
    const precio = parseFloat(formData.precio_libra);
    const total = libras * precio;
    setFormData(prev => ({
      ...prev,
      total: total.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...formData,
        libras: parseFloat(formData.libras),
        precio_libra: parseFloat(formData.precio_libra),
        total: parseFloat(formData.total)
      };

      const response = await axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/api/pagos',
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccess('Pago registrado exitosamente');
        setTimeout(() => {
          navigate('/pagos');
        }, 2000);
      } else {
        setError('Error al registrar el pago');
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión.');
      } else {
        setError('Error al procesar la solicitud. Por favor, intente nuevamente.');
      }
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
            Registrar Nuevo Pago
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
              error={!!formErrors.empleado_id}
              helperText={formErrors.empleado_id}
              sx={{ mb: 2 }}
            >
              {empleados.map((empleado) => (
                <MenuItem 
                  key={empleado.id} 
                  value={empleado.id}
                  sx={{ '&:hover': { backgroundColor: '#f5f5dc' } }}
                >
                  {`${empleado.nombre} (${empleado.cedula})`}
                </MenuItem>
              ))}
            </StyledTextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="libras"
                label="Libras Cortadas"
                name="libras"
                type="number"
                inputProps={{ 
                  step: "0.01",
                  min: "0.01"
                }}
                value={formData.libras}
                onChange={handleChange}
                error={!!formErrors.libras}
                helperText={formErrors.libras}
              />
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="precio_libra"
                label="Precio por Libra"
                name="precio_libra"
                type="number"
                inputProps={{ 
                  step: "0.01",
                  min: "0.01"
                }}
                value={formData.precio_libra}
                onChange={handleChange}
                error={!!formErrors.precio_libra}
                helperText={formErrors.precio_libra}
              />
            </Box>

            <AnimatedButton
              fullWidth
              variant="contained"
              color="secondary"
              onClick={calcularPago}
              sx={{ 
                mt: 2,
                backgroundColor: '#8d6e63',
                '&:hover': { backgroundColor: '#6d4c41' }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Calcular Pago
            </AnimatedButton>

            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="total"
              label="Total a Pagar"
              name="total"
              type="number"
              value={formData.total}
              InputProps={{
                readOnly: true,
              }}
              sx={{ 
                mt: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            />

            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="fecha_pago"
              label="Fecha de Pago"
              name="fecha_pago"
              type="date"
              value={formData.fecha_pago}
              onChange={handleChange}
              error={!!formErrors.fecha_pago}
              helperText={formErrors.fecha_pago}
              InputLabelProps={{
                shrink: true,
              }}
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
                Registrar Pago
              </AnimatedButton>
              <AnimatedButton
                fullWidth
                variant="outlined"
                sx={{
                  color: '#5d4037',
                  borderColor: '#5d4037',
                  '&:hover': { borderColor: '#3e2723' }
                }}
                onClick={() => navigate('/pagos')}
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

export default PagoForm;