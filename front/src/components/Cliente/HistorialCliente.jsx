// src/components/Cliente/HistorialCliente.jsx
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
  Button
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { UserContext } from '../../context/UserContext';
import { getContratos, descargarContrato } from '../../services/ContratoService';

const HistorialCliente = () => {
  const { user } = useContext(UserContext);
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    if (!user?.id_usuario) return;
    getContratos(user.id_usuario)
      .then(res => setContratos(res.data))
      .catch(err => {
        console.error('Error al cargar contratos:', err);
      });
  }, [user]);

  // si no hay contratos, mostramos mensaje
  if (contratos.length === 0) {
    return (
      <Box textAlign="center" mt={6}>
        <Typography variant="h6" color="text.secondary">
          Aún no tienes contratos.
        </Typography>
      </Box>
    );
  }

  // si tenemos contratos, renderizamos la tabla
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81">
        Historial de Contratos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Seguro</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contratos.map(ct => (
              <TableRow key={ct.id_usuario_seguro}>
                <TableCell>{ct.nombre}</TableCell>
                <TableCell>{new Date(ct.fecha_contrato).toLocaleDateString()}</TableCell>
                <TableCell>
                  {ct.fecha_fin ? new Date(ct.fecha_fin).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell align="center">
                  {ct.estado === 1
                    ? 'Activo'
                    : ct.estado === 2
                    ? 'Vencido'
                    : 'Cancelado'}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    startIcon={<GetAppIcon />}
                    onClick={() =>
                      window.open(descargarContrato(ct.id_usuario_seguro), '_blank')
                    }
                  >
                    Descargar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HistorialCliente;
