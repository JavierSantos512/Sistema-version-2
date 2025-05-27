import React, { useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PagosPDF from './PDFTemplates/PagosPDF';
import { getPagosByDateRange } from '../../services/pagoService';

const PagosReporte = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [dateRange, setDateRange] = useState({});

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchPagos = async (range) => {
    setLoading(true);
    try {
      const data = await getPagosByDateRange(range);
      setPagos(data);
      setDateRange(range);
    } catch (error) {
      console.error('Error fetching pagos:', error);
    }
    setLoading(false);
  };

  const handleGenerarReporte = () => {
    let range = {};
    const today = new Date();
    
    if (tabValue === 0) { // Día
      range = { 
        start: new Date(today.setHours(0, 0, 0, 0)),
        end: new Date(today.setHours(23, 59, 59, 999))
      };
    } else if (tabValue === 1) { // Semana
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      range = { 
        start: new Date(firstDay.setHours(0, 0, 0, 0)),
        end: new Date(lastDay.setHours(23, 59, 59, 999))
      };
    } else { // Mes
      range = { 
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
      };
    }
    
    fetchPagos(range);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4E342E', mb: 3 }}>
        Reporte de Pagos
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Por Día" />
        <Tab label="Por Semana" />
        <Tab label="Por Mes" />
      </Tabs>
      
      <Button 
        variant="contained" 
        onClick={handleGenerarReporte}
        sx={{ 
          backgroundColor: '#5D4037',
          '&:hover': { backgroundColor: '#4E342E' },
          mb: 3
        }}
      >
        Generar Reporte
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