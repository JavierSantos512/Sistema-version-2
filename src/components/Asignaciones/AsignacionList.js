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
  Select
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      fecha_asignacion: asignacion.fecha_asignacion.split('T')[0]
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
          fecha_asignacion: editingAsignacion.fecha_asignacion
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
  if (error) return <Container><Typography color="error" sx={{ mt: 2 }}>{error}</Typography></Container>;

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Lista de Asignaciones
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/asignaciones/nueva')}
          sx={{ mt: 4, mb: 2 }}
        >
          Nueva Asignación
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Finca</TableCell>
              <TableCell>Fecha de Asignación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignaciones
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((asignacion) => (
                <TableRow key={asignacion.id}>
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
                    {format(new Date(asignacion.fecha_asignacion), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(asignacion)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(asignacion)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={asignaciones.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar la asignación del empleado {asignacionToDelete?.empleado?.nombre} a la finca {asignacionToDelete?.finca?.nombre}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">
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
      >
        <DialogTitle>Editar Asignación</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Empleado</InputLabel>
            <Select
              name="empleado_id"
              value={editingAsignacion?.empleado_id || ''}
              onChange={handleEditChange}
              label="Empleado"
            >
              {empleados.map((empleado) => (
                <MenuItem key={empleado.id} value={empleado.id}>
                  {empleado.nombre} ({empleado.dpi})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Finca</InputLabel>
            <Select
              name="finca_id"
              value={editingAsignacion?.finca_id || ''}
              onChange={handleEditChange}
              label="Finca"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AsignacionList; 