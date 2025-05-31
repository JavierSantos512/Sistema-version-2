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
  CircularProgress
} from '@mui/material';
import { Search, Add, Edit, Delete, Refresh, FilterList } from '@mui/icons-material';
import axios from 'axios';
import JornadaForm from './JornadaForm';

const JornadaList = () => {
  const [jornadas, setJornadas] = useState([]);
  const [filteredJornadas, setFilteredJornadas] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [currentJornada, setCurrentJornada] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    fecha: '',
    empleado: '',
    finca: ''
  });

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [jornadasRes, empleadosRes, fincasRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/jornadas'),
        axios.get('http://127.0.0.1:5000/api/empleados'),
        axios.get('http://127.0.0.1:5000/api/fincas')
      ]);
      
      setJornadas(jornadasRes.data);
      setFilteredJornadas(jornadasRes.data);
      setEmpleados(empleadosRes.data);
      setFincas(fincasRes.data);
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

  // Aplicar filtros automáticamente cuando cambian
  useEffect(() => {
    handleSearch();
  }, [searchTerm, filters, jornadas]);

  // Función de búsqueda y filtrado combinado
  const handleSearch = () => {
    let results = [...jornadas];
    
    // Filtro por término de búsqueda
    if (searchTerm) {
      results = results.filter(j => {
        const empleadoNombre = j.empleado?.nombre?.toLowerCase() || '';
        const fincaNombre = j.finca?.nombre?.toLowerCase() || '';
        const empleadoDPI = j.empleado?.dpi?.toLowerCase() || '';
        
        return (
          empleadoNombre.includes(searchTerm.toLowerCase()) ||
          fincaNombre.includes(searchTerm.toLowerCase()) ||
          empleadoDPI.includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Filtro por fecha exacta
    if (filters.fecha) {
      results = results.filter(j => {
        const jornadaFecha = new Date(j.fecha).toISOString().split('T')[0];
        return jornadaFecha === filters.fecha;
      });
    }
    
    // Filtro por empleado
    if (filters.empleado) {
      results = results.filter(j => {
        const empleadoNombre = j.empleado?.nombre?.toLowerCase() || '';
        return empleadoNombre.includes(filters.empleado.toLowerCase());
      });
    }
    
    // Filtro por finca
    if (filters.finca) {
      results = results.filter(j => {
        const fincaNombre = j.finca?.nombre?.toLowerCase() || '';
        return fincaNombre.includes(filters.finca.toLowerCase());
      });
    }
    
    setFilteredJornadas(results);
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    // No necesitamos llamar a handleSearch aquí porque el useEffect lo hará
  };

  const handleDateChange = (date) => {
    const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';
    setFilters(prev => ({ ...prev, fecha: formattedDate }));
  };

  const resetFilters = () => {
    setFilters({
      fecha: '',
      empleado: '',
      finca: ''
    });
    setSearchTerm('');
  };

  // Funciones para el formulario
  const handleOpenForm = (jornada = null) => {
    setCurrentJornada(jornada);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setCurrentJornada(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const url = currentJornada 
        ? `http://127.0.0.1:5000/api/jornadas/${currentJornada.id}` 
        : 'http://127.0.0.1:5000/api/jornadas';
      const method = currentJornada ? 'put' : 'post';

      await axios[method](url, {
        empleados_id: formData.empleadoId,
        fincas_id: formData.fincaId,
        fecha: formData.fecha,
        libras_recolectadas: parseFloat(formData.libras),
        precio_libra: parseFloat(formData.precio)
      });

      fetchData();
      handleCloseForm();
    } catch (err) {
      setError(`Error guardando jornada: ${err.message}`);
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta jornada?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/jornadas/${id}`);
        fetchData();
      } catch (err) {
        setError(`Error eliminando jornada: ${err.message}`);
        console.error('Error:', err);
      }
    }
  };

  // Calculate total
  const calculateTotal = (jornada) => {
    return (jornada.libras_recolectadas * jornada.precio_libra).toFixed(2);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* Header with search and filters */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h1" sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}>
                Registro de Jornadas
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
                  placeholder="Buscar jornadas..."
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
                          <FilterList color={filterOpen ? 'primary' : 'inherit'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => handleOpenForm()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Nueva Jornada
                </Button>
                
                <IconButton onClick={() => {
                  resetFilters();
                  fetchData();
                }}>
                  <Refresh />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {filterOpen && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Filtros</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Fecha"
                    type="date"
                    value={filters.fecha}
                    onChange={(e) => handleDateChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
                          {emp.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Finca</InputLabel>
                    <Select
                      name="finca"
                      value={filters.finca}
                      onChange={handleFilterChange}
                      label="Finca"
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {fincas.map(finca => (
                        <MenuItem key={finca.id} value={finca.nombre}>
                          {finca.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={resetFilters}>
                    Limpiar Filtros
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Jornadas Table */}
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white' }}>Empleado</TableCell>
                <TableCell sx={{ color: 'white' }}>DPI</TableCell>
                <TableCell sx={{ color: 'white' }}>Finca</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Libras</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Precio/Lb</TableCell>
                <TableCell sx={{ color: 'white' }} align="right">Total</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredJornadas.length > 0 ? (
                filteredJornadas.map((jornada) => (
                  <TableRow key={jornada.id} hover>
                    <TableCell>{new Date(jornada.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{jornada.empleado.nombre}</TableCell>
                    <TableCell>{jornada.empleado.dpi || 'N/A'}</TableCell>
                    <TableCell>{jornada.finca.nombre}</TableCell>
                    <TableCell align="right">{jornada.libras_recolectadas.toFixed(2)}</TableCell>
                    <TableCell align="right">Q {jornada.precio_libra.toFixed(2)}</TableCell>
                    <TableCell align="right">Q {calculateTotal(jornada)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenForm(jornada)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(jornada.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron jornadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Jornada Form Dialog */}
        <JornadaForm
          open={openForm}
          onClose={handleCloseForm}
          jornada={currentJornada}
          empleados={empleados}
          fincas={fincas}
          onSubmit={handleSubmit}
        />
      </Box>
    </Container>
  );
};

export default JornadaList;