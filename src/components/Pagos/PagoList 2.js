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
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PagoList = () => {
  const [pagos, setPagos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState(null);
  
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingPago, setEditingPago] = useState({
    id: '',
    empleado_id: '',
    libras: '',
    precio_libra: '',
    total: '',
    fecha_pago: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const [pagosRes, empleadosRes] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/pagos', { headers }),
        axios.get('http://127.0.0.1:5000/api/empleados', { headers })
      ]);

      const pagosFormateados = pagosRes.data.map(pago => ({
        ...pago,
        libras: parseFloat(pago.libras || 0),
        precio_libra: parseFloat(pago.precio_libra || 0),
        total: parseFloat(pago.total || 0),
        fecha_pago: pago.fecha_pago.split('T')[0]
      }));

      setPagos(pagosFormateados);
      setEmpleados(empleadosRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError('Error al cargar la información');
      setLoading(false);
    }
  };

  const handleEditClick = (pago) => {
    setEditingPago({
      id: pago.id,
      empleado_id: pago.empleado_id,
      libras: pago.libras.toString(),
      precio_libra: pago.precio_libra.toString(),
      total: pago.total.toString(),
      fecha_pago: pago.fecha_pago
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (pago) => {
    setPagoToDelete(pago);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/pagos/${pagoToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOpenDeleteDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      setError('Error al eliminar el pago');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPago(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'libras' || name === 'precio_libra') {
      const libras = name === 'libras' ? parseFloat(value) : parseFloat(prev.libras);
      const precio = name === 'precio_libra' ? parseFloat(value) : parseFloat(prev.precio_libra);
      if (!isNaN(libras) && !isNaN(precio)) {
        const total = (libras * precio).toFixed(2);
        setEditingPago(prev => ({
          ...prev,
          total: total
        }));
      }
    }
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const fechaFormatoCorrecto = editingPago.fecha_pago;

      const dataToSend = {
        ...editingPago,
        libras: parseFloat(editingPago.libras),
        precio_libra: parseFloat(editingPago.precio_libra),
        fecha_pago: fechaFormatoCorrecto
      };

      await axios({
        method: 'put',
        url: `http://127.0.0.1:5000/api/pagos/${editingPago.id}`,
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setOpenEditDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      setError('Error al actualizar el pago');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Lista de Pagos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Libras</TableCell>
              <TableCell>Precio por Libra</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pago) => (
              <TableRow key={pago.id}>
                <TableCell>{pago.id}</TableCell>
                <TableCell>{pago.empleado ? `${pago.empleado.nombre} (${pago.empleado.dpi})` : 'N/A'}</TableCell>
                <TableCell>{pago.libras}</TableCell>
                <TableCell>Q{pago.precio_libra}</TableCell>
                <TableCell>Q{pago.total}</TableCell>
                <TableCell>{pago.fecha_pago}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEditClick(pago)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(pago)} size="small">
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
          count={pagos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Diálogo de Edición */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Editar Pago</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            name="empleado_id"
            label="Empleado"
            fullWidth
            value={editingPago.empleado_id}
            onChange={handleEditChange}
          >
            {empleados.map((empleado) => (
              <MenuItem key={empleado.id} value={empleado.id}>
                {empleado.nombre} ({empleado.dpi})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="libras"
            label="Libras"
            type="number"
            fullWidth
            value={editingPago.libras}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="precio_libra"
            label="Precio por Libra"
            type="number"
            fullWidth
            value={editingPago.precio_libra}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="total"
            label="Total"
            type="number"
            fullWidth
            value={editingPago.total}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="dense"
            name="fecha_pago"
            label="Fecha de Pago"
            type="date"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={editingPago.fecha_pago}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar este pago? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PagoList;