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
  InputAdornment,
  Grid,
  Toolbar,
  styled,
  alpha
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

const FincaList = () => {
  const [fincas, setFincas] = useState([]);
  const [originalFincas, setOriginalFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [fincaToDelete, setFincaToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingFinca, setEditingFinca] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFincas();
  }, []);

  const fetchFincas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/api/fincas',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setFincas(response.data);
      setOriginalFincas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar las fincas:', error);
      setError('Error al cargar la lista de fincas');
      setLoading(false);
    }
  };

  const handleDeleteClick = (finca) => {
    setFincaToDelete(finca);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'delete',
        url: `http://127.0.0.1:5000/api/fincas/${fincaToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDeleteDialog(false);
      fetchFincas();
    } catch (error) {
      console.error('Error al eliminar la finca:', error);
      setError('Error al eliminar la finca');
    }
  };

  const handleEditClick = (finca) => {
    setEditingFinca({ ...finca });
    setOpenEditDialog(true);
  };

  const handleEditChange = (event) => {
    setEditingFinca({
      ...editingFinca,
      [event.target.name]: event.target.value
    });
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'put',
        url: `http://127.0.0.1:5000/api/fincas/${editingFinca.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: editingFinca
      });
      setOpenEditDialog(false);
      fetchFincas();
    } catch (error) {
      console.error('Error al actualizar la finca:', error);
      setError('Error al actualizar la finca');
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
      setFincas(originalFincas);
    } else {
      const filtered = originalFincas.filter(finca => 
        String(finca[field]).toLowerCase().includes(value.toLowerCase())
      );
      setFincas(filtered);
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
          {/* Encabezado mejorado */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            backgroundColor: '#A1887F', // Café más claro
            color: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(145deg, #8D6E63, #BCAAA4)'
          }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 600,
              textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
            }}>
              Gestión de Fincas Cafetaleras
            </Typography>
            <CoffeeButton
              variant="contained"
              onClick={() => navigate('/fincas/nueva')}
              sx={{ 
                borderRadius: 2,
                padding: '10px 20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Nueva Finca
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar por ubicación..."
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
                    onChange={(e) => handleSearch('ubicacion', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Toolbar>
          </Paper>

          {/* Tabla de fincas */}
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
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ubicación</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fincas.length > 0 ? (
                    fincas
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((finca) => (
                        <StyledTableRow 
                          key={finca.id}
                          component={motion.tr}
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <TableCell>{finca.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{finca.nombre}</TableCell>
                          <TableCell>
                            <Box sx={{
                              backgroundColor: '#D7CCC8',
                              color: '#3E2723',
                              padding: '4px 8px',
                              borderRadius: 1,
                              display: 'inline-block',
                              fontWeight: 500
                            }}>
                              {finca.ubicacion}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              color="primary" 
                              onClick={() => handleEditClick(finca)}
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
                              onClick={() => handleDeleteClick(finca)}
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
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No se encontraron fincas
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
              count={fincas.length}
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
              ¿Está seguro que desea eliminar la finca {fincaToDelete?.nombre}?
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
            Editar Finca
          </DialogTitle>
          <DialogContent sx={{ paddingTop: 3 }}>
            <TextField
              margin="dense"
              name="nombre"
              label="Nombre"
              type="text"
              fullWidth
              variant="outlined"
              value={editingFinca?.nombre || ''}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="ubicacion"
              label="Ubicación"
              type="text"
              fullWidth
              variant="outlined"
              value={editingFinca?.ubicacion || ''}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
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

export default FincaList;