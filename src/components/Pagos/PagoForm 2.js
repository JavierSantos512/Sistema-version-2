import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';

const PagoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    empleado_id: '',
    libras: '',
    precio_libra: '',
    fecha_pago: new Date()
  });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmpleados();
    if (id) {
      fetchPago();
    }
  }, [id]);

  const fetchEmpleados = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/empleados', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setError('Error al cargar la lista de empleados');
      if (error.message.includes('token')) {
        navigate('/login');
      }
    }
  };

  const fetchPago = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`/api/pagos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setFormData({
        empleado_id: data.empleado_id,
        libras: data.libras.toString(),
        precio_libra: data.precio_libra.toString(),
        fecha_pago: new Date(data.fecha_pago)
      });
    } catch (error) {
      console.error('Error al cargar pago:', error);
      setError('Error al cargar los datos del pago');
      if (error.message.includes('token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const url = id ? `/api/pagos/${id}` : '/api/pagos';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          libras: parseFloat(formData.libras),
          precio_libra: parseFloat(formData.precio_libra),
          fecha_pago: formData.fecha_pago.toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      setSuccess('Pago guardado exitosamente');
      setTimeout(() => {
        navigate('/pagos');
      }, 2000);
    } catch (error) {
      console.error('Error al guardar pago:', error);
      setError(error.message);
      if (error.message.includes('token')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Editar Pago' : 'Nuevo Pago'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Empleado</InputLabel>
          <Select
            name="empleado_id"
            value={formData.empleado_id}
            onChange={handleChange}
            required
          >
            {empleados.map((empleado) => (
              <MenuItem key={empleado.id} value={empleado.id}>
                {empleado.nombre} - {empleado.dpi}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          margin="normal"
          label="Libras"
          name="libras"
          type="number"
          value={formData.libras}
          onChange={handleChange}
          required
          inputProps={{ step: "0.01" }}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Precio por Libra"
          name="precio_libra"
          type="number"
          value={formData.precio_libra}
          onChange={handleChange}
          required
          inputProps={{ step: "0.01" }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DatePicker
            label="Fecha de Pago"
            value={formData.fecha_pago}
            onChange={(newValue) => {
              setFormData(prev => ({
                ...prev,
                fecha_pago: newValue
              }));
            }}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
        </LocalizationProvider>

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (id ? 'Actualizar' : 'Guardar')}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default PagoForm; 