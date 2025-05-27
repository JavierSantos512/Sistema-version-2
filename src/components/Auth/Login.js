import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar fuente cursiva de Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/auth/login', {
        username: formData.username,
        password: formData.password
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError('Error en las credenciales');
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data?.message || 'Error al iniciar sesión');
      } else if (error.request) {
        setError('No se pudo conectar con el servidor');
      } else {
        setError('Error al procesar la solicitud');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f0e6'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '80%',
          maxWidth: '1000px',
          boxShadow: '0 4px 20px rgba(101, 67, 33, 0.3)',
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: '#fffaf2'
        }}
      >
        {/* Sección del formulario */}
        <Box
          sx={{
            flex: 1,
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontFamily: '"Dancing Script", cursive',
              color: '#5e3d2b',
              mb: 3,
              fontSize: '2.5rem',
              textAlign: 'center'
            }}
          >
            Bienvenido de nuevo ☕
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              sx={{
                input: { backgroundColor: '#fff5e6' },
                label: { color: '#5e3d2b' }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                input: { backgroundColor: '#fff5e6' },
                label: { color: '#5e3d2b' }
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: '#a47148',
                '&:hover': {
                  backgroundColor: '#7c5434'
                }
              }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Box>

        {/* Sección del GIF */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f1e7',
            p: 3
          }}
        >
          <Box
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(80, 50, 20, 0.3)',
              border: '4px solid #e8d6c3',
              backgroundColor: '#fff'
            }}
          >
            <img
              src="/gif-cafe.gif"
              alt="Café animado"
              style={{
                width: '280px',
                height: 'auto',
                display: 'block'
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
