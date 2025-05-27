import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EmpleadosPDF from './PDFTemplates/EmpleadosPDF';
import { getEmpleados } from '../../services/empleadoService';

const EmpleadosReporte = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const data = await getEmpleados();
        setEmpleados(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching empleados:', error);
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4E342E', mb: 3 }}>
        Reporte de Empleados
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <PDFDownloadLink 
          document={<EmpleadosPDF empleados={empleados} />} 
          fileName={`reporte_empleados_${new Date().toISOString().slice(0, 10)}.pdf`}
        >
          {({ loading }) => (
            <Button 
              variant="contained" 
              disabled={loading}
              sx={{ 
                backgroundColor: '#4E342E',
                '&:hover': { backgroundColor: '#5D4037' },
                py: 1.5,
                px: 3,
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Generando PDF...' : 'Descargar Reporte Completo'}
            </Button>
          )}
        </PDFDownloadLink>
      )}
    </Box>
  );
};

export default EmpleadosReporte;