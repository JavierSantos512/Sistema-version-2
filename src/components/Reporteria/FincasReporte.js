import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FincasPDF from './PDFTemplates/FincasPDF';
import FincaService from '../../services/fincaService';

const FincasReporte = () => {
  const [fincas, setFincas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFincas = async () => {
      try {
        const data = await FincaService.getAllFincas();
        setFincas(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar las fincas');
      } finally {
        setLoading(false);
      }
    };

    loadFincas();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#4E342E', mb: 3 }}>
        Reporte de Fincas
      </Typography>

      <Typography paragraph>
        Total de fincas registradas: {fincas.length}
      </Typography>

      <PDFDownloadLink 
        document={<FincasPDF fincas={fincas} />}
        fileName="listado_completo_fincas.pdf"
      >
        {({ loading }) => (
          <Button 
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#6D4C41',
              '&:hover': { backgroundColor: '#5D4037' },
              py: 1.5,
              px: 3,
              fontSize: '1.1rem'
            }}
          >
            {loading ? 'Generando PDF...' : 'Descargar Listado Completo'}
          </Button>
        )}
      </PDFDownloadLink>
    </Box>
  );
};

export default FincasReporte;