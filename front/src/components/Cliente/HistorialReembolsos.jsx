// src/components/Cliente/HistorialReembolsos.jsx
"use client";
import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import { UserContext } from '../../context/UserContext';
import { getReembolsos } from '../../services/ReembolsoService';

const HistorialReembolsos = () => {
  const { user } = useContext(UserContext);
  const [reembolsos, setReembolsos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id_usuario) return;
    getReembolsos(user.id_usuario)
      .then(res => setReembolsos(res.data))
      .catch(err => console.error('Error al obtener historial:', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (reembolsos.length === 0) {
    return (
      <Box textAlign="center" mt={4}>
        <Typography variant="h6" color="text.secondary">
          No hay solicitudes de reembolso registradas.
        </Typography>
      </Box>
    );
  }

  return (
    <Box mt={5}>
      <Typography variant="h5" gutterBottom color="#0D2B81">
        Historial de Reembolsos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reembolsos.map(r => (
              <TableRow key={r.id_reembolso}>
                <TableCell>{new Date(r.fecha).toLocaleDateString()}</TableCell>
                <TableCell>${r.monto.toFixed(2)}</TableCell>
                <TableCell>{r.estado}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialReembolsos;
