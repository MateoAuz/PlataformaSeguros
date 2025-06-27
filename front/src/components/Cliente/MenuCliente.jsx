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

  const handleMenuUsuario = (e) => setAnchorElUsuario(e.currentTarget);
  const handleCloseUsuario = () => setAnchorElUsuario(null);

  const handleMenuNav = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNav = () => setAnchorElNav(null);

  const inicio_login = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const irARuta = (ruta, cU = false, cN = false) => {
    if (cU) handleCloseUsuario();
    if (cN) handleCloseNav();
    navigate(ruta);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
          {/* IZQUIERDA */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton color="inherit" onClick={() => navigate("/cliente")}>
              <HomeIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>

            {/* Logo: se oculta texto en xs */}
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                height: { xs: 30, sm: 40 },
                width: { xs: 30, sm: 40 },
                ml: 1,
              }}
            />
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                ml: 1,
                display: { xs: "none", sm: "block" },
                fontWeight: 500,
              }}
            >
              Vida Plena
            </Typography>
          </Box>

          {/* CENTRO */}
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                sx={{ ml: "auto" }}
                onClick={handleMenuNav}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {[
                  { label: "Contratación", path: "/cliente/contratacion" },
                  { label: "Historial", path: "/cliente/historial" },
                  { label: "Reembolso", path: "/cliente/reembolsos" },
                  { label: "Pagos", path: "/cliente/pagos" },
                  { label: "Notificaciones", path: "/cliente/notificaciones" },
                ].map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => irARuta(item.path, false, true)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ ml: 4, display: "flex", gap: 2 }}>
              {[
                { label: "Contratación", path: "/cliente/contratacion" },
                { label: "Historial", path: "/cliente/historial" },
                { label: "Reembolso", path: "/cliente/reembolsos" },
                { label: "Pagos", path: "/cliente/pagos" },
                { label: "Notificaciones", path: "/cliente/notificaciones" },
              ].map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  color="inherit"
                  sx={{ fontSize: "0.9rem" }}
                >
                  {item.label.toUpperCase()}
                </Button>
              ))}
            </Box>
          )}

          {/* DERECHA */}
          <Box sx={{ ml: "auto" }}>
            <IconButton onClick={handleMenuUsuario} color="inherit">
              <AccountCircle fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
            <Menu
              anchorEl={anchorElUsuario}
              open={Boolean(anchorElUsuario)}
              onClose={handleCloseUsuario}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          p: { xs: 2, sm: 3 },
          backgroundColor: "#fafafa",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MenuCliente;
