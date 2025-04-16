import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            Registrar Pago
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
              error={!!formErrors.empleado_id}
              helperText={formErrors.empleado_id}
            >
              {empleados.map((empleado) => (
                <MenuItem key={empleado.id} value={empleado.id}>
                  {`${empleado.nombre} (${empleado.cedula})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
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
            <TextField
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
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={calcularPago}
              sx={{ mt: 2 }}
            >
              Calcular Pago
            </Button>
            <TextField
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
            />
            <TextField
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
              Registrar Pago
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default PagoForm; 