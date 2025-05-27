import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  Payment as PaymentIcon,
  Agriculture as AgricultureIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const Reporteria = () => {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: 'Listado de Empleados',
      description: 'Generar reporte PDF con todos los empleados registrados',
      icon: <PeopleIcon fontSize="large" />,
      color: '#4E342E',
      action: () => navigate('/reporteria/empleados')
    },
    {
      title: 'Reporte de Pagos',
      description: 'Generar reportes de pagos por día, semana o mes',
      icon: <PaymentIcon fontSize="large" />,
      color: '#5D4037',
      action: () => navigate('/reporteria/pagos')
    },
    {
      title: 'Listado de Fincas',
      description: 'Generar reporte PDF con todas las fincas registradas',
      icon: <AgricultureIcon fontSize="large" />,
      color: '#6D4C41',
      action: () => navigate('/reporteria/fincas')
    },
    {
      title: 'Recolección por Jornada',
      description: 'Reporte de libras recogidas por jornada laboral',
      icon: <TimelineIcon fontSize="large" />,
      color: '#795548',
      action: () => navigate('/reporteria/recoleccion')
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#4E342E', fontWeight: 'bold', mb: 4 }}>
        Módulo de Reportería
      </Typography>
      
      <Grid container spacing={3}>
        {reportCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                backgroundColor: card.color,
                color: 'white',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6
                }
              }}
              onClick={card.action}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {card.title}
                </Typography>
                <Typography>
                  {card.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: 'white', 
                    color: card.color,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#D7CCC8'
                    }
                  }}
                >
                  Generar Reporte
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reporteria;