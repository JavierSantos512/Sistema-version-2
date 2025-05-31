import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { Close, Save } from '@mui/icons-material';

const JornadaForm = ({ open, onClose, jornada, empleados, fincas, onSubmit }) => {
  const [formData, setFormData] = useState({
    fecha: jornada?.fecha || new Date().toISOString().split('T')[0],
    empleadoId: jornada?.empleado.id || '',
    fincaId: jornada?.finca.id || '',
    libras: jornada?.libras_recolectadas || 0,
    precio: jornada?.precio_libra || 0
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, fecha: formattedDate }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.empleadoId) newErrors.empleadoId = 'Seleccione un empleado';
    if (!formData.fincaId) newErrors.fincaId = 'Seleccione una finca';
    if (formData.libras <= 0) newErrors.libras = 'Las libras deben ser mayores a 0';
    if (formData.precio <= 0) newErrors.precio = 'El precio debe ser mayor a 0';
    
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {jornada ? 'Editar Jornada' : 'Nueva Jornada'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.empleadoId}>
                <InputLabel>Empleado</InputLabel>
                <Select
                  name="empleadoId"
                  value={formData.empleadoId}
                  onChange={handleChange}
                  label="Empleado"
                >
                  {empleados.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.nombre} {emp.cedula ? `(${emp.cedula})` : ''}
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

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.fincaId}>
                <InputLabel>Finca</InputLabel>
                <Select
                  name="fincaId"
                  value={formData.fincaId}
                  onChange={handleChange}
                  label="Finca"
                >
                  {fincas.map(finca => (
                    <MenuItem key={finca.id} value={finca.id}>
                      {finca.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.fincaId && (
                  <Typography variant="caption" color="error">
                    {errors.fincaId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Libras Recolectadas"
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
                label="Precio por Libra (Q)"
                name="precio"
                type="number"
                value={formData.precio}
                onChange={handleChange}
                error={!!errors.precio}
                helperText={errors.precio}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 2,
                p: 1,
                backgroundColor: 'primary.light',
                borderRadius: 1
              }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Q {(formData.libras * formData.precio).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ mt: 2 }}>
        <Button 
          onClick={onClose} 
          startIcon={<Close />} 
          color="secondary"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          variant="contained"
          disabled={loading}
        >
          {jornada ? 'Actualizar' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JornadaForm;