import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';

const FincaForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: ''
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
        url: 'http://127.0.0.1:5000/api/fincas',
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor:', response);
      
      if (response.status === 201) {
        setSuccess('Finca registrada exitosamente');
        setFormData({ nombre: '', ubicacion: '' });
        setError('');
      } else {
        setError('Error al registrar finca');
        setSuccess('');
      }
    } catch (error) {
      console.error('Error completo:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al registrar finca');
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
            Registro de Finca
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nombre"
              label="Nombre de la Finca"
              name="nombre"
              autoComplete="off"
              autoFocus
              value={formData.nombre}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="ubicacion"
              label="Ubicación"
              name="ubicacion"
              value={formData.ubicacion}
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
              Registrar Finca
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default FincaForm; 