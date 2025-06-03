"use client";
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { getContratos } from '../../services/ContratoService';
import { UserContext } from '../../context/UserContext';

const estadoColor = {
  0: { label: 'Pendiente', color: 'warning' },
  1: { label: 'Aceptado', color: 'success' },
  2: { label: 'Rechazado', color: 'error' },
  3: { label: 'Rechazado', color: 'error' }
};

export const HistorialCliente = () => {
  const { usuario } = useContext(UserContext);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;

    getContratos(usuario.id_usuario)
      .then(res => setContratos(res.data))
      .catch(err => console.error('Error al cargar historial:', err))
      .finally(() => setLoading(false));
  }, [usuario]);

  if (loading) {
    return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
  }

  if (contratos.length === 0) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h4" gutterBottom color="#0D2B81">
          Historial de Contratos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aún no has realizado ninguna contratación.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81">
        Historial de Contratos
      </Typography>

      <Grid container spacing={3}>
        {contratos.map((contrato) => (
          <Grid item xs={12} sm={6} md={4} key={contrato.id_usuario_seguro_per}>
            <Card sx={{ backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="h6">{contrato.nombre}</Typography>
                <Typography variant="body2">Tipo: {contrato.tipo}</Typography>
                <Typography variant="body2">
                  Inicio: {new Date(contrato.fecha_contrato).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Modalidad de pago: {contrato.modalidad_pago}
                </Typography>
                <Chip
                  label={estadoColor[contrato.estado]?.label || 'Desconocido'}
                  color={estadoColor[contrato.estado]?.color || 'default'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HistorialCliente;
