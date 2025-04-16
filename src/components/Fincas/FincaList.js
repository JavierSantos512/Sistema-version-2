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
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const FincaList = () => {
  const [fincas, setFincas] = useState([]);
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Container><Typography color="error" sx={{ mt: 2 }}>{error}</Typography></Container>;

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
          Lista de Fincas
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/fincas/nueva')}
          sx={{ mt: 4, mb: 2 }}
        >
          Nueva Finca
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fincas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((finca) => (
                <TableRow key={finca.id}>
                  <TableCell>{finca.id}</TableCell>
                  <TableCell>{finca.nombre}</TableCell>
                  <TableCell>{finca.ubicacion}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(finca)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(finca)}
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
          count={fincas.length}
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
            ¿Está seguro que desea eliminar la finca {fincaToDelete?.nombre}?
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
        <DialogTitle>Editar Finca</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="nombre"
            label="Nombre"
            type="text"
            fullWidth
            value={editingFinca?.nombre || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="ubicacion"
            label="Ubicación"
            type="text"
            fullWidth
            value={editingFinca?.ubicacion || ''}
            onChange={handleEditChange}
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

export default FincaList; 