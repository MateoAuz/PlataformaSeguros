import React, { useState } from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Box, Button
} from '@mui/material';
import {
    Home as HomeIcon,
    AccountCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './MenuCliente.css';


export const MenuCliente = ({ children }) => {
    const [auth, setAuth] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleNavigate = (ruta) => {
        navigate(ruta);
    };

    const inicio_login = () => {
        localStorage.removeItem("usuario");
        setAuth(false);
        navigate('/login', { replace: true });
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" className="barra-navegacion">
                <Toolbar className="barra-contenido">
                    <Box className="barra-izquierda">
                        <IconButton color="inherit" onClick={() => navigate('/cliente')}>
                            <HomeIcon />
                        </IconButton>
                        <img src="/logo.png" alt="Logo" className="logo-barra" />
                        <Typography variant="h6" className="titulo">
                            SISTEMA DE SEGUROS "Vida Plena"
                        </Typography>
                    </Box>

                    <Box className="barra-centro">
                        <Button onClick={() => navigate('/cliente/contratacion')}>CONTRATACIÓN</Button>
                        <Button onClick={() => navigate('/cliente/historial')}>HISTORIAL</Button>
                        <Button onClick={() => navigate('/cliente/reembolsos')}>REEMBOLSO</Button>
                        <Button onClick={() => navigate('/cliente/pagos')}>PAGOS</Button>
                        <Button onClick={() => navigate('/cliente/notificaciones')}>NOTIFICACIONES</Button>
                    </Box>
                  
                    <Box className="barra-derecha">
                       <IconButton onClick={handleMenu} color="inherit">
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem onClick={() => { handleClose(); navigate('/cliente/perfil'); }}>Perfil</MenuItem>
                            <MenuItem onClick={inicio_login}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Contenido de la página */}
            <Box sx={{ backgroundColor: '#ffffff', minHeight: '100vh', p: 3 }}>
                {children}
            </Box>
        </Box>
    );
};

export default MenuCliente;
