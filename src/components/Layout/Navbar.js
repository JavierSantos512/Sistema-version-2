import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, IconButton, AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentIcon from '@mui/icons-material/Payment';
import WorkIcon from '@mui/icons-material/Work'; // Nuevo icono para Jornadas
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Empleados', icon: <PeopleIcon />, path: '/empleados' },
    { text: 'Fincas', icon: <AgricultureIcon />, path: '/fincas' },
    { text: 'Asignaciones', icon: <AssignmentIcon />, path: '/asignaciones' },
    { text: 'Pagos', icon: <PaymentIcon />, path: '/pagos' },
    { text: 'Jornadas', icon: <WorkIcon />, path: '/jornadas' }, // Nuevo item
    { text: 'Reportería', icon: <DescriptionIcon />, path: '/reporteria' }
  ];

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#4E342E' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold', color: '#D7CCC8' }} onClick={() => navigate('/dashboard')}>
            Sistema de Gestión de Café
          </Typography>
          {user.id && (
            <Box>
              <Button color="inherit" sx={{ fontWeight: 'bold', color: '#D7CCC8' }} onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={toggleDrawer} sx={{ '& .MuiDrawer-paper': { bgcolor: '#4E342E', color: 'white', width: 280 } }}>
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => { toggleDrawer(); navigate(item.path); }}
              sx={{ 
                bgcolor: '#D7CCC8',
                borderRadius: '30px',
                width: '80%',
                mb: 2,
                transition: '0.3s',
                '&:hover': { 
                  bgcolor: '#A1887F',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#6D4C41' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ textAlign: 'center', fontWeight: 'bold', color: '#4E342E' }} />
            </ListItem>
          ))}
          {user.id && (
            <ListItem 
              button 
              onClick={() => { toggleDrawer(); handleLogout(); }} 
              sx={{ 
                bgcolor: '#FF8A65',
                borderRadius: '30px',
                width: '80%',
                mb: 2,
                transition: '0.3s',
                '&:hover': { 
                  bgcolor: '#D84315',
                  transform: 'scale(1.05)' 
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Cerrar Sesión" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'white' }} />
            </ListItem>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;