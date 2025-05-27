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
  Card,
  CardContent,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

// Componentes estilizados
const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: '#f5f5dc', // Fondo beige claro
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const AnimatedButton = motion(Button);

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
  borderRadius: '12px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fff9f0',
  },
  '&:hover': {
    backgroundColor: '#f0e6d2 !important',
  },
}));

const PagoList = () => {
  const [pagos, setPagos] = useState([]);
  const [totalDia, setTotalDia] = useState(0);
  const [totalMes, setTotalMes] = useState(0);
  const [totalPorFecha, setTotalPorFecha] = useState(0);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Obtener fecha actual formateada
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-GT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Obtener mes actual formateado
  const getCurrentMonth = () => {
    const today = new Date();
    return today.toLocaleDateString('es-GT', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/api/pagos', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const pagosData = response.data.map(pago => ({
        ...pago,
        fecha_pago: new Date(pago.fecha_pago).toISOString().split("T")[0]
      }));

      setPagos(pagosData);

      const hoy = new Date().toISOString().split("T")[0];
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const anioActual = fechaActual.getFullYear();

      const totalDiaCalculado = pagosData.reduce((acc, pago) => {
        return pago.fecha_pago === hoy ? acc + Number(pago.total) : acc;
      }, 0);
      setTotalDia(totalDiaCalculado);

      const totalMesCalculado = pagosData.reduce((acc, pago) => {
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getMonth() + 1 === mesActual && fechaPago.getFullYear() === anioActual
          ? acc + Number(pago.total)
          : acc;
      }, 0);
      setTotalMes(totalMesCalculado);

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar los pagos:', error);
      setError('Error al cargar la lista de pagos');
      setLoading(false);
    }
  };

  const handleFechaChange = (event) => {
    const fechaElegida = event.target.value;
    setFechaSeleccionada(fechaElegida);

    const totalCalculado = pagos.reduce((acc, pago) => {
      return pago.fecha_pago === fechaElegida ? acc + Number(pago.total) : acc;
    }, 0);

    setTotalPorFecha(totalCalculado);
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
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ mt: 4, mb: 2, color: '#5a4a42', fontWeight: 'bold' }}>
          Lista de Pagos
        </Typography>
        <AnimatedButton
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/pagos/nuevo')}
          sx={{ mt: 4, mb: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Nuevo Pago
        </AnimatedButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <StyledCard sx={{ minWidth: 250, flexGrow: 1 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">Total del Día</Typography>
            <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Q{totalDia.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ color: '#5a4a42', mt: 1 }}>{getCurrentDate()}</Typography>
          </CardContent>
        </StyledCard>
        <StyledCard sx={{ minWidth: 250, flexGrow: 1 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">Total del Mes</Typography>
            <Typography variant="h5" sx={{ color: '#1565c0', fontWeight: 'bold' }}>Q{totalMes.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ color: '#5a4a42', mt: 1 }}>{getCurrentMonth()}</Typography>
          </CardContent>
        </StyledCard>
      </Box>

      <Box sx={{ 
        mb: 4, 
        p: 3, 
        borderRadius: 2, 
        bgcolor: 'rgba(255, 255, 255, 0.8)', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#5a4a42' }}>Filtrar por fecha específica:</Typography>
        <TextField
          type="date"
          variant="outlined"
          value={fechaSeleccionada}
          onChange={handleFechaChange}
          sx={{
            width: '50%',
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#d7ccc8',
              },
              '&:hover fieldset': {
                borderColor: '#a1887f',
              },
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
        {fechaSeleccionada && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: '#e8f5e9', 
            borderRadius: 2,
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32' }}>
              Total pagado el {new Date(fechaSeleccionada).toLocaleDateString('es-GT')}: 
              <span style={{ marginLeft: '8px' }}>Q{totalPorFecha.toFixed(2)}</span>
            </Typography>
          </Box>
        )}
      </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#8d6e63' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Empleado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Libras</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Precio por Libra</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha de Pago</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagos
                .filter(pago => fechaSeleccionada ? pago.fecha_pago === fechaSeleccionada : true)
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pago) => (
                  <StyledTableRow key={pago.id}>
                    <TableCell>{pago.id}</TableCell>
                    <TableCell>{pago.empleado ? `${pago.empleado.nombre} (${pago.empleado.dpi})` : 'N/A'}</TableCell>
                    <TableCell>{pago.libras}</TableCell>
                    <TableCell>
                      Q{typeof pago.precio_libra === 'number' ? pago.precio_libra.toFixed(2) : Number(pago.precio_libra || 0).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Q{typeof pago.total === 'number' ? pago.total.toFixed(2) : Number(pago.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(pago.fecha_pago).toLocaleDateString('es-GT')}</TableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          labelRowsPerPage="Filas por página"
          sx={{ bgcolor: '#efebe9' }}
        />
      </Paper>
    </StyledContainer>
  );
};

export default PagoList;