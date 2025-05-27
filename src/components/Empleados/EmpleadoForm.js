import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Fade,
  styled
} from '@mui/material';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Tema personalizado en tonos café (coherente con EmpleadoList)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6D4C41', // Café oscuro
    },
    secondary: {
      main: '#D7CCC8', // Beige claro
    },
    background: {
      default: '#EFEBE9', // Beige muy claro
      paper: '#FFFFFF', // Blanco para contrastar
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
      color: '#5D4037',
    },
  },
});

// Componente estilizado para el botón
const CoffeeButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  transition: 'all 0.3s ease',
  padding: '12px 0',
  fontWeight: 600,
  fontSize: '1rem',
}));

const EmpleadoForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    tipo_empleado: 'Recolector'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/api/empleados',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201) {
        setSuccess('Recolector registrado exitosamente');
        setFormData({ 
          nombre: '', 
          cedula: '', 
          telefono: '',
          tipo_empleado: 'Recolector'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al registrar recolector');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container 
        component="main" 
        maxWidth="sm"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          py: 4
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={4} 
            sx={{ 
              p: 5,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(to bottom, #FFFFFF, #F5F5F5)'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography 
                component="h1" 
                variant="h5"
                sx={{
                  mb: 3,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1.8rem'
                }}
              >
                Registrar Nuevo Recolector
              </Typography>
              
              <Box 
                component="form" 
                onSubmit={handleSubmit} 
                sx={{ 
                  mt: 1,
                  width: '100%'
                }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="nombre"
                  label="Nombre Completo"
                  name="nombre"
                  autoComplete="name"
                  autoFocus
                  value={formData.nombre}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="cedula"
                  label="DPI"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="telefono"
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                />
                
                <FormControl 
                  fullWidth 
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    }
                  }}
                >
                  <InputLabel>Tipo de Empleado</InputLabel>
                  <Select
                    name="tipo_empleado"
                    value={formData.tipo_empleado}
                    label="Tipo de Empleado"
                    onChange={handleChange}
                  >
                    <MenuItem value="Recolector">Recolector</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="Administrativo">Administrativo</MenuItem>
                    <MenuItem value="Transportista">Transportista</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Mensajes de feedback */}
                <Fade in={!!error}>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                </Fade>
                
                <Fade in={!!success}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                </Fade>
                
                <CoffeeButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    borderRadius: 1,
                  }}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Recolector'}
                </CoffeeButton>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </ThemeProvider>
  );
};

export default EmpleadoForm;