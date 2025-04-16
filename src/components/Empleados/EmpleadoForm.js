import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';

const EmpleadoForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        url: 'http://127.0.0.1:5000/api/empleados',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor:', response);
      
      if (response.status === 201) {
        setSuccess('Empleado registrado exitosamente');
        setFormData({ nombre: '', cedula: '', telefono: '' });
        setError('');
      } else {
        setError('Error al registrar empleado');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al registrar empleado');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
      setSuccess('');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Registro de Empleado
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mt: 2 }}>
                {success}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Registrar Empleado
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmpleadoForm; 