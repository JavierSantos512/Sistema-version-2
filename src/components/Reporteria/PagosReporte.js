import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PagosPDF from './PDFTemplates/PagosPDF';
import PagoService from '../../services/pagoService';

const PagosReporte = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [dateRange, setDateRange] = useState({});
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
  };

  const fetchPagos = async (range) => {
    setLoading(true);
    setError(null);
    try {
      const data = await PagoService.getPagosByDateRange(range);
      setPagos(data);
      setDateRange(range);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      setError('Error al cargar los pagos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = () => {
    const today = new Date();
    let range = {};

    switch(tabValue) {
      case 0: // Día
        range = { 
          start: new Date(today.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
        break;
      case 1: // Semana
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        range = { 
          start: new Date(firstDay.setHours(0, 0, 0, 0)),
          end: new Date(lastDay.setHours(23, 59, 59, 999))
        };
        break;
      case 2: // Mes
        range = { 
          start: new Date(today.getFullYear(), today.getMonth(), 1),
          end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        };
        break;
      default:
        break;
    }
    
    fetchPagos(range);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4E342E', mb: 3 }}>
        Reporte de Pagos
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Por Día" />
        <Tab label="Por Semana" />
        <Tab label="Por Mes" />
      </Tabs>
      
      <Button 
        variant="contained" 
        onClick={handleGenerarReporte}
        disabled={loading}
        sx={{ 
          backgroundColor: '#5D4037',
          '&:hover': { backgroundColor: '#4E342E' },
          mb: 3
        }}
      >
        {loading ? 'Cargando...' : 'Generar Reporte'}
      </Button>
      
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 2 }} />}
      
      {pagos.length > 0 && !loading && (
        <PDFDownloadLink 
          document={<PagosPDF pagos={pagos} dateRange={dateRange} period={['Día', 'Semana', 'Mes'][tabValue]} />} 
          fileName={`reporte_pagos_${['dia', 'semana', 'mes'][tabValue]}_${new Date().toISOString().slice(0, 10)}.pdf`}
        >
          {({ loading }) => (
            <Button 
              variant="contained" 
              disabled={loading}
              sx={{ 
                backgroundColor: '#4E342E',
                '&:hover': { backgroundColor: '#3E2723' },
                py: 1.5,
                px: 3,
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Generando PDF...' : 'Descargar Reporte'}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </Box>
  );
};

export default PagosReporte;