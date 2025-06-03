// src/components/Clientes/ClientesPendientes/ClientesPendientes.jsx
"use client";
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper, Typography, Button, Stack, Divider, Box
} from '@mui/material';
import { getSolicitudesClientes, activarCliente } from '../../../services/ClienteService';

const ClientesPendientes = ({ onCrear }) => {
  const [solicitudes, setSolicitudes] = useState([]);

  const cargarSolicitudes = async () => {
    try {
      const res = await getSolicitudesClientes();
      setSolicitudes(res.data);
    } catch (err) {
      console.error('Error al cargar solicitudes de cliente:', err);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const aceptarSolicitud = async (solicitud) => {
    try {
      await activarCliente(solicitud.id_usuario);
      cargarSolicitudes();
      onCrear();
    } catch (err) {
      console.error('Error al activar cliente:', err);
    }
  };

  if (solicitudes.length === 0) return null;

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2, borderLeft: '5px solid #0D2B81' }}>
      <Typography variant="h6" gutterBottom>Solicitudes de Registro de Clientes</Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {solicitudes.map((solicitud, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography><b>{solicitud.nombre} {solicitud.apellido}</b></Typography>
              <Typography variant="body2">{solicitud.correo} — {solicitud.username}</Typography>
            </Box>
            <Button variant="contained" onClick={() => aceptarSolicitud(solicitud)}>
              Crear Cliente
            </Button>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

ClientesPendientes.propTypes = {
  onCrear: PropTypes.func.isRequired
};

export default ClientesPendientes;
