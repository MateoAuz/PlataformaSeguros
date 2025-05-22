import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, MenuItem, Menu,
    Drawer, List, ListItem, ListItemText, ListItemIcon, useTheme, useMediaQuery, Box
} from '@mui/material';
import {
    Menu as MenuIcon,
    AccountCircle,
    Shield as ShieldIcon,
    Description as DescriptionIcon,
    MonetizationOn as MonetizationOnIcon,
    History as HistoryIcon,
    Notifications as NotificationsIcon,
    Home as HomeIcon,
    RateReview as RateReviewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const MenuCliente = ({ children }) => {
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
                    backgroundColor: '#0D2B81'
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
                        onClick={() => navigate('/cliente')}
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
                                <MenuItem onClick={() => { handleClose(); navigate('/cliente/perfil'); }}>
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
                <List>
                    <ListItem button onClick={() => handleNavigate('/cliente/seguros')}>
                        <ListItemIcon><ShieldIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Seguros" />
                    </ListItem>

                    <ListItem button onClick={() => handleNavigate('/cliente/contratacion')}>
                        <ListItemIcon><DescriptionIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Contratación" />
                    </ListItem>

                    <ListItem button onClick={() => handleNavigate('/cliente/pagos')}>
                        <ListItemIcon><MonetizationOnIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Pagos" />
                    </ListItem>

                    <ListItem button onClick={() => handleNavigate('/cliente/reembolsos')}>
                        <ListItemIcon><RateReviewIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Reembolsos" />
                    </ListItem>

                    <ListItem button onClick={() => handleNavigate('/cliente/historial')}>
                        <ListItemIcon><HistoryIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Historial" />
                    </ListItem>

                    <ListItem button onClick={() => handleNavigate('/cliente/notificaciones')}>
                        <ListItemIcon><NotificationsIcon sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary="Notificaciones" />
                    </ListItem>
                </List>

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
                    backgroundColor: '#FFF3E0',
                    minHeight: '100vh'
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

MenuCliente.propTypes = {};