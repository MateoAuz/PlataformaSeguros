"use client";
import { AccountCircle, Home as HomeIcon, Menu as MenuIcon } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MenuCliente.css";

export const MenuCliente = ({ children }) => {
  const [anchorElUsuario, setAnchorElUsuario] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuUsuario = (event) => setAnchorElUsuario(event.currentTarget);
  const handleCloseUsuario = () => setAnchorElUsuario(null);

  const handleMenuNav = (event) => setAnchorElNav(event.currentTarget);
  const handleCloseNav = () => setAnchorElNav(null);

  const inicio_login = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  // Función genérica para navegar y cerrar menús
  const irARuta = (ruta, cerrarUsuario = false, cerrarNav = false) => {
    if (cerrarUsuario) handleCloseUsuario();
    if (cerrarNav) handleCloseNav();
    navigate(ruta);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className="barra-navegacion">
        <Toolbar className="barra-contenido">
          {/* Bloque IZQUIERDA: icono Home + logo + título */}
          <Box className="barra-izquierda">
            <IconButton color="inherit" onClick={() => navigate("/cliente")}>
              <HomeIcon />
            </IconButton>
            <img src="/logo.png" alt="Logo" className="logo-barra" />
            <Typography variant="h6" className="titulo">
              SISTEMA DE SEGUROS "Vida Plena"
            </Typography>
          </Box>

          {/* Bloque CENTRO: botones o ícono de menú según tamaño */}
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleMenuNav}
                sx={{ ml: "auto" }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNav}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={() => irARuta("/cliente/contratacion", false, true)}>
                  CONTRATACIÓN
                </MenuItem>
                <MenuItem onClick={() => irARuta("/cliente/historial", false, true)}>
                  HISTORIAL
                </MenuItem>
                <MenuItem onClick={() => irARuta("/cliente/reembolsos", false, true)}>
                  REEMBOLSO
                </MenuItem>
                <MenuItem onClick={() => irARuta("/cliente/pagos", false, true)}>
                  PAGOS
                </MenuItem>
                <MenuItem onClick={() => irARuta("/cliente/notificaciones", false, true)}>
                  NOTIFICACIONES
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box className="barra-centro" sx={{ ml: 2, flexGrow: 1 }}>
              <Button onClick={() => navigate("/cliente/contratacion")} color="inherit">
                CONTRATACIÓN
              </Button>
              <Button onClick={() => navigate("/cliente/historial")} color="inherit">
                HISTORIAL
              </Button>
              <Button onClick={() => navigate("/cliente/reembolsos")} color="inherit">
                REEMBOLSO
              </Button>
              <Button onClick={() => navigate("/cliente/pagos")} color="inherit">
                PAGOS
              </Button>
              <Button onClick={() => navigate("/cliente/notificaciones")} color="inherit">
                NOTIFICACIONES
              </Button>
            </Box>
          )}

          {/* Bloque DERECHA: ícono Usuario + menú */}
          <Box className="barra-derecha" sx={{ ml: isMobile ? 0 : "auto" }}>
            <IconButton onClick={handleMenuUsuario} color="inherit">
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorElUsuario}
              open={Boolean(anchorElUsuario)}
              onClose={handleCloseUsuario}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => irARuta("/cliente/perfil", true, false)}>
                Perfil
              </MenuItem>
              <MenuItem onClick={inicio_login}>Cerrar sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido de la página */}
      <Box sx={{ backgroundColor: "#ffffff", minHeight: "100vh", p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default MenuCliente;
