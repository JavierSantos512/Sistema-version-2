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
  TablePagination,
  Box,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  styled,
  alpha,
  InputAdornment,
  Toolbar,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Tema personalizado en tonos café
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
    h4: {
      fontWeight: 500,
      color: '#5D4037',
    },
  },
});

// Componente estilizado para las filas de la tabla con animación
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.01)',
    transition: 'all 0.3s ease',
  },
  cursor: 'pointer',
}));

// Componente estilizado para los botones
const CoffeeButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  transition: 'all 0.3s ease',
}));

const EmpleadoList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [originalEmpleados, setOriginalEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmpleados();
  }, []);

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
      setOriginalEmpleados(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los empleados:', error);
      setError('Error al cargar la lista de empleados');
      setLoading(false);
    }
  };

  const handleDeleteClick = (empleado) => {
    setEmpleadoToDelete(empleado);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'delete',
        url: `http://127.0.0.1:5000/api/empleados/${empleadoToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDeleteDialog(false);
      fetchEmpleados();
    } catch (error) {
      console.error('Error al eliminar el empleado:', error);
      setError('Error al eliminar el empleado');
    }
  };

  const handleEditClick = (empleado) => {
    setEditingEmpleado({ ...empleado });
    setOpenEditDialog(true);
  };

  const handleEditChange = (event) => {
    setEditingEmpleado({
      ...editingEmpleado,
      [event.target.name]: event.target.value
    });
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'put',
        url: `http://127.0.0.1:5000/api/empleados/${editingEmpleado.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: editingEmpleado
      });
      setOpenEditDialog(false);
      fetchEmpleados();
    } catch (error) {
      console.error('Error al actualizar el empleado:', error);
      setError('Error al actualizar el empleado');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (field, value) => {
    if (value === '') {
      setEmpleados(originalEmpleados);
    } else {
      const filtered = originalEmpleados.filter(emp => 
        String(emp[field]).toLowerCase().includes(value.toLowerCase())
      );
      setEmpleados(filtered);
    }
    setPage(0);
  };

  const handleTypeFilter = (type) => {
    if (type === '') {
      setEmpleados(originalEmpleados);
    } else {
      const filtered = originalEmpleados.filter(emp => 
        emp.tipo_empleado === type
      );
      setEmpleados(filtered);
    }
    setPage(0);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: theme.palette.background.default
        }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Container sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', paddingTop: 4 }}>
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ 
        backgroundColor: theme.palette.background.default, 
        minHeight: '100vh',
        paddingTop: 4,
        paddingBottom: 4
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Encabezado mejorado con mejor contraste */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            backgroundColor: '#A1887F', // Café más claro
            color: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(246, 234, 234, 0.1)',
            background: 'linear-gradient(145deg, #8D6E63, #BCAAA4)'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              textShadow: '1px 1px 3px rgb(147, 123, 123)'
            }}>
              Listado de Empleados
            </Typography>
            <CoffeeButton
              variant="contained"
              onClick={() => navigate('/empleados/nuevo')}
              sx={{ 
                borderRadius: 2,
                padding: '10px 20px',
                boxShadow: '0 2px 4px rgba(211, 197, 197, 0.98)'
              }}
            >
              Nuevo Empleado
            </CoffeeButton>
          </Box>

          {/* Barra de búsqueda/filtro */}
          <Paper elevation={2} sx={{ 
            mb: 3, 
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05)
          }}>
            <Toolbar>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por nombre..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                    onChange={(e) => handleSearch('nombre', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por DPI..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                    onChange={(e) => handleSearch('cedula', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por teléfono..."
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }
                    }}
                    onChange={(e) => handleSearch('telefono', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de empleado</InputLabel>
                    <Select
                      label="Tipo de empleado"
                      sx={{
                        borderRadius: 2,
                        backgroundColor: 'white'
                      }}
                      onChange={(e) => handleTypeFilter(e.target.value)}
                      defaultValue=""
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Recolector">Recolector</MenuItem>
                      <MenuItem value="Caporal">Caporal</MenuItem>
                      <MenuItem value="Pesador">Pesador</MenuItem>
                      <MenuItem value="Administrador de Finca">Administrador de Finca</MenuItem>
                      <MenuItem value="Contador">Contador</MenuItem>
                      <MenuItem value="Encargado de Logística">Encargado de Logística</MenuItem>
                      <MenuItem value="Encargado de Calidad">Encargado de Calidad</MenuItem>
                      <MenuItem value="Gerente General">Gerente General</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Toolbar>
          </Paper>

          {/* Tabla de empleados */}
          <Paper elevation={3} sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            mb: 4
          }}>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>DPI</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Teléfono</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empleados.length > 0 ? (
                    empleados
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((empleado) => (
                        <StyledTableRow 
                          key={empleado.id}
                          component={motion.tr}
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <TableCell>{empleado.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{empleado.nombre}</TableCell>
                          <TableCell>{empleado.cedula}</TableCell>
                          <TableCell>{empleado.telefono}</TableCell>
                          <TableCell>
                            <Box sx={{
                              backgroundColor: empleado.tipo_empleado === 'Recolector' ? '#D7CCC8' : 
                                              empleado.tipo_empleado === 'Supervisor' ? '#A1887F' :
                                              empleado.tipo_empleado === 'Administrativo' ? '#8D6E63' : '#BCAAA4',
                              color: '#3E2723',
                              padding: '4px 8px',
                              borderRadius: 1,
                              display: 'inline-block',
                              fontWeight: 500
                            }}>
                              {empleado.tipo_empleado || 'No especificado'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEditClick(empleado)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                marginRight: 1,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteClick(empleado)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.error.main, 0.2),
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </StyledTableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron empleados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={empleados.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              sx={{ 
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            />
          </Paper>
        </motion.div>

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 2,
              minWidth: '400px'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            fontWeight: 600
          }}>
            Confirmar Eliminación
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 3 }}>
            <DialogContentText>
              ¿Está seguro que desea eliminar al recolector {empleadoToDelete?.nombre}?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: 3 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
              sx={{
                backgroundColor: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de edición */}
        <Dialog
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              padding: 2,
              minWidth: '500px'
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            fontWeight: 600
          }}>
            Editar Recolector
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 3 }}>
            <TextField
              margin="dense"
              name="nombre"
              label="Nombre"
              type="text"
              fullWidth
              variant="outlined"
              value={editingEmpleado?.nombre || ''}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="cedula"
              label="DPI"
              type="text"
              fullWidth
              variant="outlined"
              value={editingEmpleado?.cedula || ''}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="telefono"
              label="Teléfono"
              type="text"
              fullWidth
              variant="outlined"
              value={editingEmpleado?.telefono || ''}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Empleado</InputLabel>
              <Select
                name="tipo_empleado"
                value={editingEmpleado?.tipo_empleado || ''}
                label="Tipo de Empleado"
                onChange={handleEditChange}
              >
                <MenuItem value="Recolector">Recolector</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
                <MenuItem value="Administrativo">Administrativo</MenuItem>
                <MenuItem value="Transportista">Transportista</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ padding: 3 }}>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Cancelar
            </Button>
            <CoffeeButton
              onClick={handleEditSubmit}
              sx={{
                borderRadius: 1,
                padding: '8px 20px'
              }}
            >
              Guardar Cambios
            </CoffeeButton>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default EmpleadoList;