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
  
  // Estados para el diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pagoToDelete, setPagoToDelete] = useState(null);
  
  // Estados para el diálogo de edición
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

      // Convertir los valores numéricos
      const pagosFormateados = pagosRes.data.map(pago => ({
        ...pago,
        libras: parseFloat(pago.libras || 0),
        precio_libra: parseFloat(pago.precio_libra || 0),
        total: parseFloat(pago.total || 0)
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Funciones para el manejo de la eliminación
  const handleDeleteClick = (pago) => {
    setPagoToDelete(pago);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios({
        method: 'delete',
        url: `http://127.0.0.1:5000/api/pagos/${pagoToDelete.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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

  // Funciones para el manejo de la edición
  const handleEditClick = (pago) => {
    setEditingPago({
      id: pago.id,
      empleado_id: pago.empleado_id,
      libras: pago.libras.toString(),
      precio_libra: pago.precio_libra.toString(),
      total: pago.total.toString(),
      fecha_pago: new Date(pago.fecha_pago).toISOString().split('T')[0]
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPago(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular el total si cambian las libras o el precio
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
      const dataToSend = {
        ...editingPago,
        libras: parseFloat(editingPago.libras),
        precio_libra: parseFloat(editingPago.precio_libra)
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

  const formatNumber = (number) => {
    return isNaN(number) ? '0.00' : number.toFixed(2);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Lista de Pagos
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/pagos/nuevo')}
          sx={{ mt: 4, mb: 2 }}
        >
          Nuevo Pago
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Empleado (DPI)</TableCell>
              <TableCell>Libras</TableCell>
              <TableCell>Precio/Libra</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((pago) => (
                <TableRow key={pago.id}>
                  <TableCell>{pago.id}</TableCell>
                  <TableCell>
                    {pago.empleado ? 
                      `${pago.empleado.nombre} (${pago.empleado.dpi})` : 
                      'N/A'}
                  </TableCell>
                  <TableCell>{formatNumber(pago.libras)}</TableCell>
                  <TableCell>Q{formatNumber(pago.precio_libra)}</TableCell>
                  <TableCell>Q{formatNumber(pago.total)}</TableCell>
                  <TableCell>
                    {new Date(pago.fecha_pago).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(pago)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(pago)}
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
          count={pagos.length}
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
            ¿Está seguro que desea eliminar este pago?
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
      >
        <DialogTitle>Editar Pago</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="normal"
            required
            fullWidth
            id="empleado_id"
            label="Empleado"
            name="empleado_id"
            value={editingPago.empleado_id}
            onChange={handleEditChange}
          >
            {empleados.map((empleado) => (
              <MenuItem key={empleado.id} value={empleado.id}>
                {`${empleado.nombre} (${empleado.cedula})`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            id="libras"
            label="Libras Cortadas"
            name="libras"
            type="number"
            inputProps={{ 
              step: "0.01",
              min: "0.01"
            }}
            value={editingPago.libras}
            onChange={handleEditChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="precio_libra"
            label="Precio por Libra"
            name="precio_libra"
            type="number"
            inputProps={{ 
              step: "0.01",
              min: "0.01"
            }}
            value={editingPago.precio_libra}
            onChange={handleEditChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="total"
            label="Total a Pagar"
            name="total"
            type="number"
            value={editingPago.total}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="fecha_pago"
            label="Fecha de Pago"
            name="fecha_pago"
            type="date"
            value={editingPago.fecha_pago}
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

export default PagoList; 