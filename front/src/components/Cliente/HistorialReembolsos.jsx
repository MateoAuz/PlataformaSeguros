// src/components/Cliente/HistorialReembolsos.jsx
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
  CircularProgress,
  Chip
} from '@mui/material';
import { UserContext } from '../../context/UserContext';
import { getHistorialReembolsos } from '../../services/ReembolsoService';

const estadoColor = {
  PENDIENTE: { label: 'Pendiente', color: 'warning' },
  APROBADO:  { label: 'Aceptado',  color: 'success' },
  RECHAZADO: { label: 'Rechazado', color: 'error' }
};

const HistorialReembolsos = () => {
  const { usuario } = useContext(UserContext);
  const [reembolsos, setReembolsos] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!usuario?.id_usuario) {
      setLoading(false);
      return;
    }
    getHistorialReembolsos(usuario.id_usuario)
      .then(res => setReembolsos(res.data))
      .catch(err => console.error('Error al obtener historial:', err))
      .finally(() => setLoading(false));
  }, [usuario]);

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
              <TableCell><strong>Seguro</strong></TableCell> 
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Monto</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reembolsos.map(r => (
              <TableRow key={r.id_reembolso}>
                <TableCell>{r.seguro}</TableCell>  
                <TableCell>
                  {new Date(r.fecha).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  ${parseFloat(r.monto).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={estadoColor[r.estado]?.label || r.estado}
                    color={estadoColor[r.estado]?.color}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialReembolsos;
