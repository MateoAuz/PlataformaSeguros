// src/components/Cliente/NotificacionesCliente.jsx
import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, CircularProgress, Alert, Stack, Button, FormControl } from "@mui/material";
import { getNotificaciones, clearNotificaciones } from '../../services/NotificacionService';
import { UserContext } from '../../context/UserContext';

export const NotificacionesCliente = () => {
  const { usuario } = useContext(UserContext);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

    // función para recargar la lista
  const fetchAll = () => {
    setLoading(true);
    getNotificaciones(usuario.id_usuario)
      .then(res => setNotificaciones(res.data))
      .catch(() => setNotificaciones([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!usuario?.id_usuario) {
      setLoading(false);      // libera el spinner si no hay usuario
      return;
    }
    fetchAll();
  }, [usuario]);


  
  if (loading) return <Box textAlign="center" mt={6}><CircularProgress/></Box>;
  if (!notificaciones.length) {
    return (
      <Box textAlign="center" mt={6}>
        <Typography variant="h6" color="text.secondary">
          No tienes notificaciones recientes.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" color="#0D2B81">
          Notificaciones
        </Typography>
    </Box>
    <Box display="flex" justifyContent="flex-end" p={2}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          sx={{ width: '20%', height: 30, borderRadius: 1 }}
          
          onClick={async () => {
            try {
              await clearNotificaciones(usuario.id_usuario);
              setNotificaciones([]);    // vacía la lista
            } catch {
              // opcional: mostrar snackbar
            }
          }}
          
        >
          Limpiar todo
        </Button>
      </Box>


      <Stack spacing={2}>
        {notificaciones.map(n => (
          <Alert key={n.id_notificacion} severity="info">
            {n.mensaje}
          </Alert>
        ))}
      </Stack>
    </Box>
  );
};

export default NotificacionesCliente;
