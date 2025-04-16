import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, MenuItem } from '@mui/material';
import axios from 'axios';

const AsignacionForm = () => {
  const [formData, setFormData] = useState({
    empleado_id: '',
    finca_id: ''
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

      console.log('Respuesta del servidor:', response);
      
      if (response.status === 201) {
        setSuccess('Asignación creada exitosamente');
        setFormData({ empleado_id: '', finca_id: '' });
        setError('');
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
            Asignar Empleado a Finca
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
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
                <MenuItem key={empleado.id} value={empleado.id}>
                  {empleado.nombre} - {empleado.cedula}
                </MenuItem>
              ))}
            </TextField>
            <TextField
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
                <MenuItem key={finca.id} value={finca.id}>
                  {finca.nombre} - {finca.ubicacion}
                </MenuItem>
              ))}
            </TextField>
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
              Crear Asignación
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AsignacionForm; 