"use client";
import React, { useState } from 'react';
import {
  AppBar, Box, Toolbar, Typography, IconButton,
  MenuItem, Menu, Drawer, List, ListItem,
  ListItemIcon, ListItemText, useTheme, useMediaQuery,
  ListItemButton
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';

import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

export const MenuAdmin = ({ children }) => {
  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const esPantallaChica = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!esPantallaChica);
  const location = useLocation();
  const rutaActual = location.pathname;

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  const navigate = useNavigate();

  const inicio_login = () => {
    localStorage.removeItem("usuario");
    setAuth(false);
    navigate('/login', { replace: true });
  };

  const handleNavigate = (ruta) => {
    navigate(ruta);
    if (esPantallaChica) setDrawerOpen(false);
  };

  const menuItems = [
    { text: 'Usuarios', icon: <PeopleIcon />, path: '/admin/usuarios' },
    { text: 'Seguros', icon: <SecurityIcon />, path: '/admin/seguros' },
    { text: 'Clientes', icon: <PersonIcon />, path: '/admin/clientes' },
    { text: 'Contratación', icon: <AssignmentIcon />, path: '/admin/contratacion' },
    { text: 'Revisión', icon: <RateReviewIcon />, path: '/admin/revision' },
    { text: 'Reporte', icon: <BarChartIcon />, path: '/admin/reportes' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #1565c0 0%, rgb(19, 108, 79) 100%)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="Abrir menú lateral"
            title="Menú"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ mr: 1 }}
            aria-label="Inicio"
            title="Inicio"
          >
            <HomeIcon />
          </IconButton>
          <img src="/logo.png" alt="Logo" style={{ height: '50px', marginRight: '10px' }} />
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
          >
            SISTEMA DE SEGUROS "Vida Plena"
          </Typography>
          {auth && (
            <>
              <IconButton
                size="large"
                aria-label="Cuenta"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/admin/perfil'); }}>
                  Perfil
                </MenuItem>
                <MenuItem onClick={inicio_login}>Cerrar sesión</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={esPantallaChica ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            backgroundColor: '#215780',
            color: 'white',
            transition: 'width 0.3s'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem disablePadding key={item.text}>
                <ListItemButton
                  selected={rutaActual === item.path}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          ml: esPantallaChica ? 0 : (drawerOpen ? '250px' : 0),
          transition: 'all 0.3s ease',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

MenuAdmin.propTypes = {
  children: PropTypes.node
};
