import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Box,
  Grid,
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip
} from '@mui/material';
import { Search, Add, Edit, Delete, Refresh, FilterList, AttachMoney } from '@mui/icons-material';
import axios from 'axios';
import PagoForm from './PagoForm';

const PagoList = () => {
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [currentPago, setCurrentPago] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    fecha: '',
    empleado: '',
    montoMinimo: '',
    montoMaximo: ''
  });

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pagosRes, empleadosRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/pagos'),
        axios.get('http://127.0.0.1:5000/api/empleados')
      ]);
      
      setPagos(pagosRes.data);
      setFilteredPagos(pagosRes.data);
      setEmpleados(empleadosRes.data);
      setError('');
    } catch (err) {
      setError(`Error cargando datos: ${err.message}`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aplicar filtros automáticamente
  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters, pagos]);

  // Función de búsqueda y filtrado
  const handleSearch = () => {
    let results = [...pagos];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      results = results.filter(p => {
        const empleadoNombre = p.empleado?.nombre?.toLowerCase() || '';
        const empleadoDPI = p.empleado?.dpi?.toLowerCase() || '';
        
        return (
          empleadoNombre.includes(searchTerm.toLowerCase()) ||
          empleadoDPI.includes(searchTerm.toLowerCase()) ||
          p.total.toString().includes(searchTerm)
        );
      });
    }
    
    // Filtro por fecha exacta
    if (filters.fecha) {
      results = results.filter(p => {
        const pagoFecha = new Date(p.fecha_pago).toISOString().split('T')[0];
        return pagoFecha === filters.fecha;
      });
    }
    
    // Filtro por empleado
    if (filters.empleado) {
      results = results.filter(p => {
        const empleadoNombre = p.empleado?.nombre?.toLowerCase() || '';
        return empleadoNombre.includes(filters.empleado.toLowerCase());
      });
    }
    
    // Filtro por monto mínimo
    if (filters.montoMinimo) {
      results = results.filter(p => p.total >= parseFloat(filters.montoMinimo));
    }
    
    // Filtro por monto máximo
    if (filters.montoMaximo) {
      results = results.filter(p => p.total <= parseFloat(filters.montoMaximo));
    }
    
    setFilteredPagos(results);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
    setFilters(prev => ({ ...prev, fecha: formattedDate }));
  };

  const resetFilters = () => {
    setFilters({
      fecha: '',
      empleado: '',
      montoMinimo: '',
      montoMaximo: ''
    });
    setSearchTerm('');
  };

  // Funciones para el formulario
  const handleOpenForm = (pago = null) => {
    setCurrentPago(pago);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentPago(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const url = currentPago 
        ? `http://127.0.0.1:5000/api/pagos/${currentPago.id}` 
        : 'http://127.0.0.1:5000/api/pagos';
      const method = currentPago ? 'put' : 'post';

      const response = await axios[method](url, {
        empleado_id: formData.empleadoId,
        libras: parseFloat(formData.libras),
        precio_libra: parseFloat(formData.precioLibra)
      });

      fetchData();
      handleCloseForm();
    } catch (err) {
      setError(`Error guardando pago: ${err.message}`);
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este pago?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/pagos/${id}`);
        fetchData();
      } catch (err) {
        setError(`Error eliminando pago: ${err.message}`);
        console.error('Error:', err);
      }
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
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Header con buscador y filtros */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'primary.light' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h1" sx={{ 
                fontWeight: 'bold',
                color: 'white'
           }}>
               Registro de Pagos
              </Typography>
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                          <FilterList color={filterOpen ? 'secondary' : 'inherit'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { backgroundColor: 'white' }
                  }}
                />
                
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<Add />}
                  onClick={() => handleOpenForm()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Nuevo Pago
                </Button>
                
                <IconButton 
                  onClick={() => {
                    resetFilters();
                    fetchData();
                  }}
                  sx={{ backgroundColor: 'white' }}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {filterOpen && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>Filtros Avanzados</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha de Pago"
                    type="date"
                    value={filters.fecha}
                    onChange={(e) => handleDateChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Empleado</InputLabel>
                    <Select
                      name="empleado"
                      value={filters.empleado}
                      onChange={handleFilterChange}
                      label="Empleado"
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {empleados.map(emp => (
                        <MenuItem key={emp.id} value={emp.nombre}>
                          {emp.nombre} ({emp.cedula})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Monto Mínimo (Q)"
                    name="montoMinimo"
                    type="number"
                    value={filters.montoMinimo}
                    onChange={handleFilterChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Monto Máximo (Q)"
                    name="montoMaximo"
                    type="number"
                    value={filters.montoMaximo}
                    onChange={handleFilterChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={resetFilters}
                    color="secondary"
                  >
                    Limpiar Filtros
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Tabla de Pagos */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'secondary.main' }}>
                <TableCell sx={{ color: 'white' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white' }}>Empleado</TableCell>
                <TableCell sx={{ color: 'white' }}>DPI</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Libras</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Precio/Lb</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Total</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress color="secondary" />
                  </TableCell>
                </TableRow>
              ) : filteredPagos.length > 0 ? (
                filteredPagos.map((pago) => (
                  <TableRow key={pago.id} hover>
                    <TableCell>
                      {new Date(pago.fecha_pago).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {pago.empleado.nombre}
                        {pago.total > 1000 && (
                          <Chip label="Alto" size="small" color="success" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{pago.empleado.dpi || 'N/A'}</TableCell>
                    <TableCell align="right">{pago.libras.toFixed(2)}</TableCell>
                    <TableCell align="right">{formatMoney(pago.precio_libra)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatMoney(pago.total)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenForm(pago)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(pago.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron pagos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Formulario de Pagos */}
        <PagoForm
          open={openForm}
          onClose={handleCloseForm}
          pago={currentPago}
          empleados={empleados}
          onSubmit={handleSubmit}
        />
      </Box>
    </Container>
  );
};

export default PagoList;