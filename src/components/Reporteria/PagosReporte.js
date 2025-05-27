import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, MenuItem, CircularProgress, Alert } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PagosPDF from './PDFTemplates/PagosPDF';
import pagoService from '../../services/pagoService';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const PagosReporte = () => {
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('dia'); // día, semana, mes
  const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calcularRangoFechas = (filtro, fecha) => {
    const fechaObj = parseISO(fecha);
    
    switch (filtro) {
      case 'dia':
        return {
          fechaInicio: format(fechaObj, 'yyyy-MM-dd'),
          fechaFin: format(fechaObj, 'yyyy-MM-dd')
        };
      case 'semana':
        return {
          fechaInicio: format(startOfWeek(fechaObj), 'yyyy-MM-dd'),
          fechaFin: format(endOfWeek(fechaObj), 'yyyy-MM-dd')
        };
      case 'mes':
        return {
          fechaInicio: format(startOfMonth(fechaObj), 'yyyy-MM-dd'),
          fechaFin: format(endOfMonth(fechaObj), 'yyyy-MM-dd')
        };
      default:
        throw new Error('Filtro no válido');
    }
  };

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { fechaInicio, fechaFin } = calcularRangoFechas(filtro, fecha);
        const data = await pagoService.getPagosPorFecha(fechaInicio, fechaFin);
        
        setPagos(data);
      } catch (err) {
        console.error("Error al obtener pagos:", err);
        setError('Error al cargar los pagos. Por favor intente nuevamente.');
        setPagos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [filtro, fecha]);

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Reporte de Pagos
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          type="date"
          label="Selecciona fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          select
          label="Filtrar por"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          fullWidth
        >
          <MenuItem value="dia">Día</MenuItem>
          <MenuItem value="semana">Semana</MenuItem>
          <MenuItem value="mes">Mes</MenuItem>
        </TextField>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Total de pagos: {pagos.length}
          </Typography>

          {pagos.length > 0 ? (
            <PDFDownloadLink
              document={<PagosPDF pagos={pagos} />}
              fileName={`reporte_pagos_${fecha}_${filtro}.pdf`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="contained" color="primary" size="large">
                Descargar Reporte
              </Button>
            </PDFDownloadLink>
          ) : (
            <Alert severity="info">No hay pagos para el período seleccionado</Alert>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PagosReporte;