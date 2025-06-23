// src/components/Contratacion.jsx
"use client";
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { getSolicitudesPendientes, aceptarContrato, rechazarContrato } from '../../services/ContratoService';
import DetalleSolicitudAgente from './DetalleSolicitudAgente';

import './Contratacion.css';

export const Contratacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  const [confirmarRechazo, setConfirmarRechazo] = useState(false);
  const [idARechazar, setIdARechazar] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const cargarSolicitudes = () => {
    getSolicitudesPendientes()
      .then(res => {
        setSolicitudes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar solicitudes:', err);
        setSnackbar({ open: true, message: 'Error al cargar solicitudes', severity: 'error' });
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleDecision = async (id, accion) => {
    try {
      if (accion === 'aceptar') {
        await aceptarContrato(id);
        setSnackbar({ open: true, message: 'Contrato aceptado', severity: 'success' });
        cargarSolicitudes();
      }
      // no procesar rechazo aquí; se maneja en diálogo
    } catch (err) {
      console.error('Error al actualizar contrato:', err);
      setSnackbar({ open: true, message: 'Error al procesar la decisión', severity: 'error' });
    }
  };

  return (
    <Box p={4} pt={{ xs: 10, sm: 6 }} className="revision">

      <Typography variant="h4" gutterBottom color="primary">
        Solicitudes de Contratación Pendientes
      </Typography>

      {loading ? <CircularProgress sx={{ mt: 4 }} /> : (
        <Paper elevation={3}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Seguro</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell><strong>Pago</strong></TableCell>
                  <TableCell><strong>Fecha</strong></TableCell>
                  <TableCell><strong>Acción</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {solicitudes.map(s => (
                  <TableRow key={s.id_usuario_seguro}>
                    <TableCell>{s.nombre_usuario} {s.apellido}</TableCell>
                    <TableCell>{s.nombre_seguro}</TableCell>
                    <TableCell>{s.tipo}</TableCell>
                    <TableCell>{s.tiempo_pago}</TableCell>
                    <TableCell>{s.fecha_contrato}</TableCell>
                    <TableCell>
                      <Box
                        display="flex"
                        flexDirection={{ xs: 'row', sm: 'column' }}
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setIdSeleccionado(s.id_usuario_seguro);
                            setDetalleAbierto(true);
                          }}
                        >
                          Ver Detalle
                        </Button>
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleDecision(s.id_usuario_seguro, 'aceptar')}
                        >
                          Aceptar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setIdARechazar(s.id_usuario_seguro);
                            setMotivoRechazo('');
                            setConfirmarRechazo(true);
                          }}
                        >
                          Rechazar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={confirmarRechazo} onClose={() => setConfirmarRechazo(false)}>
        <DialogTitle>Motivo de rechazo</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Introduce el motivo por el que rechazas este contrato:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo"
            fullWidth
            multiline
            minRows={2}
            value={motivoRechazo}
            onChange={e => setMotivoRechazo(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarRechazo(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!motivoRechazo.trim()) {
                setSnackbar({ open: true, message: 'Debe indicar un motivo', severity: 'warning' });
                return;
              }
              try {
                await rechazarContrato(idARechazar, motivoRechazo);
                setSnackbar({ open: true, message: 'Contrato rechazado correctamente', severity: 'success' });
                cargarSolicitudes();
              } catch (err) {
                console.error('❌ Error al rechazar contrato:', err);
                setSnackbar({ open: true, message: 'Error al rechazar contrato', severity: 'error' });
              } finally {
                setConfirmarRechazo(false);
                setIdARechazar(null);
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {detalleAbierto && (
        <DetalleSolicitudAgente
          open={detalleAbierto}
          idContrato={idSeleccionado}
          onClose={() => {
            setDetalleAbierto(false);
            setIdSeleccionado(null);
          }}
        />
      )}
    </Box>
  );
};

Contratacion.propTypes = {};
