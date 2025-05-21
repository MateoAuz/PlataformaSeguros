"use client";
import React, { useState } from 'react';
import './MenuAgente.css';
import {
  AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu,
  Drawer, List, ListItem, ListItemText, ListItemIcon, useTheme, useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  RateReview as RateReviewIcon,
  BarChart as BarChartIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const MenuAgente = ({ children }) => {
  const theme = useTheme();
  const esPantallaChica = useMediaQuery(theme.breakpoints.down('sm'));

  const [auth, setAuth] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(!esPantallaChica);

  const navigate = useNavigate();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  const handleNavigate = (ruta) => {
    navigate(ruta);
    if (esPantallaChica) setDrawerOpen(false);
  };

  const inicio_login = () => {
    localStorage.removeItem("usuario");
    setAuth(false);
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#002980'
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/agente')}
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          <img src="/logo.png" alt="Logo" className="logo" style={{ height: '50px', marginRight: '10px' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
            SISTEMA DE SEGUROS "Vida Plena"
          </Typography>
          {auth && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
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
                <MenuItem onClick={() => { handleClose(); navigate('/agente/perfil'); }}>
                  Perfil
                </MenuItem>
                <MenuItem onClick={inicio_login}>Cerrar sesión</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
					variant={esPantallaChica ? 'temporary' : 'persistent'}
					open={drawerOpen}
					onClose={toggleDrawer}
					sx={{
						display: { xs: 'block', sm: 'block' },
						'& .MuiDrawer-paper': {
							width: 250,
							boxSizing: 'border-box',
							backgroundColor: '#63A6B0',
							color: 'white',
						},
					}}
				>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button onClick={() => handleNavigate('/agente/clientes')}>
              <ListItemIcon><PersonIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/agente/contratacion')}>
              <ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Contratación" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/agente/revision')}>
              <ListItemIcon><RateReviewIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Revisión" />
            </ListItem>

            <ListItem button onClick={() => handleNavigate('/agente/reportes')}>
              <ListItemIcon><BarChartIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Reporte" />
            </ListItem>
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



MenuAgente.propTypes = {};
