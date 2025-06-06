"use client";
import React, { useContext, useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent, Divider
} from '@mui/material';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

const estadoColor = {
  0: { label: 'Pendiente', color: 'warning' },
  1: { label: 'Aceptado', color: 'success' },
  2: { label: 'Rechazado', color: 'error' },
  3: { label: 'Rechazado', color: 'error' }
};

const HistorialCliente = () => {
  const { usuario } = useContext(UserContext);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleContrato, setDetalleContrato] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!usuario) return;

    // ← CAMBIO: ahora llamamos a "/contratos/usuario/:id" para obtener TODOS los contratos (incluyendo 'estado')
    axios.get(`http://localhost:3030/contratos/usuario/${usuario.id_usuario}`)
      .then(res => {
        setContratos(res.data);
      })
      .catch(err => console.error('Error al cargar historial:', err))
      .finally(() => setLoading(false));
  }, [usuario]);

  const handleOpen = (id) => {
    axios.get(`http://localhost:3030/contratos/detalle-simple/${id}`)
      .then(res => {
        setDetalleContrato(res.data);
        setDialogOpen(true);
      })
      .catch(() => alert("Error al cargar detalles"));
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDetalleContrato(null);
  };

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
      <Typography variant="h4" gutterBottom color="#0D2B81" fontWeight="bold">
        Historial de Contratos
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Seguro</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Pago</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Acción</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {contratos.map((c) => (
              <TableRow key={c.id_usuario_seguro}>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>{c.tipo}</TableCell>
                <TableCell>{c.fecha_contrato}</TableCell>
                <TableCell>{c.modalidad_pago}</TableCell>
                <TableCell>
                  <Chip
                    label={estadoColor[c.estado]?.label || 'Desconocido'}
                    color={estadoColor[c.estado]?.color || 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(c.id_usuario_seguro)}
                  >
                    Ver Detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de detalle */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0D2B81', color: 'white' }}>
          Detalle del Contrato
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {detalleContrato ? (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">Datos del Seguro</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Typography><strong>Seguro:</strong> {detalleContrato.nombre_seguro}</Typography>
                <Typography><strong>Tipo:</strong> {detalleContrato.tipo}</Typography>
                <Typography><strong>Precio:</strong> ${detalleContrato.precio}</Typography>
                <Typography><strong>Modalidad de pago:</strong> {detalleContrato.modalidad_pago}</Typography>
                <Typography><strong>Cobertura:</strong> ${detalleContrato.cobertura}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom color="primary">Beneficios</Typography>
              <ul>
                {detalleContrato.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom color="primary">Beneficiarios</Typography>
              {detalleContrato.beneficiarios?.length ? (
                <ul>
                  {detalleContrato.beneficiarios.map((b, i) => (
                    <li key={i}>
                      <strong>{b.nombre}</strong> – {b.parentesco} – <em>C.I. {b.cedula}</em>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>No hay beneficiarios registrados.</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom color="primary">Documentos Requeridos</Typography>
              {detalleContrato.requisitos?.map((r, i) => (
                <li key={i}>
                  {r.nombre}
                  {r.archivo ? (
                    <>
                      {" – "}
                      <a href={`http://localhost:3030/${r.archivo}`} target="_blank" rel="noreferrer">
                        Ver documento
                      </a>
                    </>
                  ) : (
                    <span style={{ color: 'gray' }}>No cargado</span>
                  )}
                </li>
              ))}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom color="primary">Firma Electrónica</Typography>
              <a href={`http://localhost:3030/${detalleContrato.firma}`} target="_blank" rel="noreferrer">
                Ver firma
              </a>
            </Box>
          ) : (
            <Typography>Cargando detalles...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HistorialCliente;
