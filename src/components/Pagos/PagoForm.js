import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { Close, Save, AttachMoney } from '@mui/icons-material';

const PagoForm = ({ open, onClose, pago, empleados, onSubmit }) => {
  const [formData, setFormData] = useState({
    empleadoId: '',
    libras: 0,
    precioLibra: 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Calcular total
  const total = formData.libras * formData.precioLibra;

  // Inicializar formulario
  useEffect(() => {
    if (pago) {
      setFormData({
        empleadoId: pago.empleado.id,
        libras: pago.libras,
        precioLibra: pago.precio_libra
      });
    } else {
      setFormData({
        empleadoId: '',
        libras: 0,
        precioLibra: 0
      });
    }
    setErrors({});
  }, [pago, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.empleadoId) newErrors.empleadoId = 'Seleccione un empleado';
    if (formData.libras <= 0) newErrors.libras = 'Las libras deben ser mayores a 0';
    if (formData.precioLibra <= 0) newErrors.precioLibra = 'El precio por libra debe ser mayor a 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Formatear dinero
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney /> {pago ? 'Editar Pago' : 'Registrar Nuevo Pago'}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.empleadoId}>
                <InputLabel>Empleado *</InputLabel>
                <Select
                  name="empleadoId"
                  value={formData.empleadoId}
                  onChange={handleChange}
                  label="Empleado *"
                >
                  {empleados.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.nombre} ({emp.cedula})
                    </MenuItem>
                  ))}
                </Select>
                {errors.empleadoId && (
                  <Typography variant="caption" color="error">
                    {errors.empleadoId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Libras *"
                name="libras"
                type="number"
                value={formData.libras}
                onChange={handleChange}
                error={!!errors.libras}
                helperText={errors.libras}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio por Libra (Q) *"
                name="precioLibra"
                type="number"
                value={formData.precioLibra}
                onChange={handleChange}
                error={!!errors.precioLibra}
                helperText={errors.precioLibra}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: 'primary.light',
                borderRadius: 1
              }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Total a Pagar:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={formatMoney(total)} 
                    color="secondary" 
                    sx={{ 
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      padding: '0.5rem'
                    }} 
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          startIcon={<Close />} 
          color="secondary"
          variant="outlined"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {pago ? 'Actualizar Pago' : 'Guardar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PagoForm;