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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

// Componentes estilizados
const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f5f5dc',
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const AnimatedButton = motion(Button);

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fff9f0',
  },
  '&:hover': {
    backgroundColor: '#f0e6d2 !important',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#d7ccc8',
    },
    '&:hover fieldset': {
      borderColor: '#a1887f',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8d6e63',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#5d4037',
  },
}));

const AsignacionList = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [asignacionToDelete, setAsignacionToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFinca, setFiltroFinca] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [asignacionesRes, empleadosRes, fincasRes] = await Promise.all([
        axios({
          method: 'get',
          url: 'http://127.0.0.1:5000/api/asignaciones',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        axios({
          method: 'get',
          url: 'http://127.0.0.1:5000/api/empleados',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }),
        axios({
          method: 'get',
          url: 'http://127.0.0.1:5000/api/fincas',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      setAsignaciones(asignacionesRes.data);
      setEmpleados(empleadosRes.data);
      setFincas(fincasRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError('Error al cargar la lista de asignaciones');
      setLoading(false);
    }
  };

  const filtrarAsignaciones = (asignaciones) => {
    return asignaciones.filter(asignacion => {
      const cumpleNombre = filtroNombre === '' || 
        (asignacion.empleado?.nombre?.toLowerCase().includes(filtroNombre.toLowerCase()));
      
      const cumpleFinca = filtroFinca === '' || 
        (asignacion.finca?.nombre?.toLowerCase().includes(filtroFinca.toLowerCase()));
      
      const cumpleFecha = filtroFecha === '' || 
        (format(new Date(asignacion.fecha_asignacion), 'yyyy-MM-dd') === filtroFecha);
      
      return cumpleNombre && cumpleFinca && cumpleFecha;
    });
  };

  const handleDeleteClick = (asignacion) => {
    setAsignacionToDelete(asignacion);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'delete',
        url: `http://127.0.0.1:5000/api/asignaciones/${asignacionToDelete.id}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDeleteDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar la asignación:', error);
      setError('Error al eliminar la asignación');
    }
  };

  const handleEditClick = (asignacion) => {
    setEditingAsignacion({
      ...asignacion,
      empleado_id: asignacion.empleado?.id,
      finca_id: asignacion.finca?.id,
      fecha_asignacion: asignacion.fecha_asignacion.split('T')[0],
      descripcion: asignacion.descripcion || ''
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (event) => {
    setEditingAsignacion({
      ...editingAsignacion,
      [event.target.name]: event.target.value
    });
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'put',
        url: `http://127.0.0.1:5000/api/asignaciones/${editingAsignacion.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          empleado_id: editingAsignacion.empleado_id,
          finca_id: editingAsignacion.finca_id,
          fecha_asignacion: editingAsignacion.fecha_asignacion,
          descripcion: editingAsignacion.descripcion
        }
      });
      setOpenEditDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error al actualizar la asignación:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al actualizar la asignación');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return (
    <StyledContainer>
      <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
    </StyledContainer>
  );

  const asignacionesFiltradas = filtrarAsignaciones(asignaciones);

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mt: 4, mb: 2, color: '#5a4a42', fontWeight: 'bold' }}>
          Lista de Asignaciones
        </Typography>
        <AnimatedButton
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/asignaciones/nueva')}
          sx={{ mt: 4, mb: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Nueva Asignación
        </AnimatedButton>
      </Box>

      {/* Filtro de búsqueda */}
      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2, 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ color: '#5a4a42', mr: 2 }}>
          Filtros:
        </Typography>
        
        <StyledTextField
          label="Buscar por empleado"
          variant="outlined"
          size="small"
          value={filtroNombre}
          onChange={(e) => {
            setFiltroNombre(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, bgcolor: 'white' }}
        />
        
        <StyledTextField
          label="Buscar por finca"
          variant="outlined"
          size="small"
          value={filtroFinca}
          onChange={(e) => {
            setFiltroFinca(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, bgcolor: 'white' }}
        />
        
        <StyledTextField
          label="Filtrar por fecha"
          type="date"
          variant="outlined"
          size="small"
          value={filtroFecha}
          onChange={(e) => {
            setFiltroFecha(e.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1, bgcolor: 'white' }}
        />
        
        <Button 
          variant="outlined" 
          onClick={() => {
            setFiltroNombre('');
            setFiltroFinca('');
            setFiltroFecha('');
            setPage(0);
          }}
          sx={{ 
            color: '#5d4037', 
            borderColor: '#5d4037',
            '&:hover': { borderColor: '#3e2723' }
          }}
        >
          Limpiar
        </Button>
      </Box>

      <StyledPaper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#8d6e63' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Finca</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Asignación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asignacionesFiltradas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((asignacion) => (
                  <StyledTableRow key={asignacion.id}>
                    <TableCell>{asignacion.id}</TableCell>
                    <TableCell>
                      {asignacion.empleado ? 
                        `${asignacion.empleado.nombre} (${asignacion.empleado.dpi})` : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {asignacion.finca ? 
                        `${asignacion.finca.nombre} - ${asignacion.finca.ubicacion}` : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {asignacion.descripcion || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(asignacion.fecha_asignacion), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditClick(asignacion)}
                        size="small"
                        sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(asignacion)}
                        size="small"
                        sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={asignacionesFiltradas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          sx={{ bgcolor: '#efebe9' }}
        />
      </StyledPaper>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#fff9f0'
          }
        }}
      >
        <DialogTitle sx={{ color: '#5d4037', fontWeight: 'bold' }}>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la asignación del empleado {asignacionToDelete?.empleado?.nombre} a la finca {asignacionToDelete?.finca?.nombre}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ color: '#5d4037' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#fff9f0'
          }
        }}
      >
        <DialogTitle sx={{ color: '#5d4037', fontWeight: 'bold' }}>Editar Asignación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Empleado</InputLabel>
            <Select
              name="empleado_id"
              value={editingAsignacion?.empleado_id || ''}
              onChange={handleEditChange}
              label="Empleado"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d7ccc8',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a1887f',
                  },
                },
              }}
            >
              {empleados.map((empleado) => (
                <MenuItem key={empleado.id} value={empleado.id}>
                  {empleado.nombre} ({empleado.dpi})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Finca</InputLabel>
            <Select
              name="finca_id"
              value={editingAsignacion?.finca_id || ''}
              onChange={handleEditChange}
              label="Finca"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#d7ccc8',
                  },
                  '&:hover fieldset': {
                    borderColor: '#a1887f',
                  },
                },
              }}
            >
              {fincas.map((finca) => (
                <MenuItem key={finca.id} value={finca.id}>
                  {finca.nombre} - {finca.ubicacion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="fecha_asignacion"
            label="Fecha de Asignación"
            type="date"
            fullWidth
            value={editingAsignacion?.fecha_asignacion || ''}
            onChange={handleEditChange}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="descripcion"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            value={editingAsignacion?.descripcion || ''}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: '#5d4037' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary"
            variant="contained"
            sx={{ backgroundColor: '#5d4037', '&:hover': { backgroundColor: '#3e2723' } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default AsignacionList;