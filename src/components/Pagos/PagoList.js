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
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PagoList = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'get',
        url: 'http://127.0.0.1:5000/api/pagos',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setPagos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los pagos:', error);
      setError('Error al cargar la lista de pagos');
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
              <TableCell>Empleado</TableCell>
              <TableCell>Libras</TableCell>
              <TableCell>Precio por Libra</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Fecha de Pago</TableCell>
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
                  <TableCell>{pago.libras}</TableCell>
                  <TableCell>Q{pago.precio_libra}</TableCell>
                  <TableCell>Q{pago.total}</TableCell>
                  <TableCell>
                    {new Date(pago.fecha_pago).toLocaleDateString()}
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
    </Container>
  );
};

export default PagoList; 