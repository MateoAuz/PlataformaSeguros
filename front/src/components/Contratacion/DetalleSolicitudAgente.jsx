import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, List, ListItem, ListItemText, CircularProgress, Box, Paper
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/HealthAndSafety';
import { getDetalleContrato } from '../../services/ContratoService';

export const DetalleSolicitudAgente = ({ open, onClose, idContrato }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && idContrato) {
      setLoading(true);
      getDetalleContrato(idContrato)
        .then(res => {
          setDetalle(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al obtener detalles del contrato:', err);
          setLoading(false);
        });
    }
  }, [open, idContrato]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <ShieldIcon sx={{ color: "#0D2B81", mr: 1, verticalAlign: "middle" }} />
        Detalle de Solicitud
      </DialogTitle>
      <DialogContent dividers>
        {loading ? <CircularProgress /> : detalle && (
          <>
            {/* Info principal */}
            <Paper sx={{ mb: 2, p: 2, bgcolor: "#F8FAFF" }}>
              <Typography fontWeight="bold">
                Cliente: <span style={{ fontWeight: "normal" }}>{detalle.cliente} {detalle.apellido_cliente}</span>
              </Typography>
              <Typography fontWeight="bold" component="span">
                Fecha: <span style={{ fontWeight: "normal" }}>{detalle.fecha_contrato}</span> – <b>Hora:</b> <span style={{ fontWeight: "normal" }}>{detalle.hora}</span>
              </Typography>
              <Typography fontWeight="bold">
                Seguro: <span style={{ fontWeight: "normal" }}>{detalle.seguro} ({detalle.tipo})</span>
              </Typography>
            </Paper>

            {/* Firma */}
            <Typography fontWeight="bold" sx={{ mb: 1 }}>
              Firma Electrónica del Cliente:
            </Typography>
            <Box sx={{ mb: 2, pl: 2 }}>
              {detalle.firma
                ? <a href={detalle.firma} target="_blank" rel="noopener noreferrer">Ver PDF de la firma electrónica</a>
                : <span>No se adjuntó firma.</span>
              }
            </Box>

            {/* Beneficiarios */}
            <Typography fontWeight="bold" sx={{ mb: 1 }}>Beneficiarios</Typography>
            <Paper sx={{ mb: 2, p: 1 }}>
              {detalle.beneficiarios?.length > 0
                ? (
                  <List dense>
                    {detalle.beneficiarios.map((b, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={`${b.nombre} (${b.parentesco})`}
                          secondary={`Cédula: ${b.cedula} | Nacimiento: ${b.nacimiento}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )
                : <Typography color="text.secondary">No hay beneficiarios registrados.</Typography>
              }
            </Paper>

            {/* Requisitos/documentos */}
            <Typography fontWeight="bold" sx={{ mb: 1 }}>Documentos Requeridos Adjuntos:</Typography>
            <Paper sx={{ mb: 2, p: 1 }}>
              {detalle.requisitos?.length > 0
                ? (
                  <List dense>
                    {detalle.requisitos.map((r, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={r.nombre}
                          secondary={r.archivo
                            ? <a href={r.archivo} target="_blank" rel="noopener noreferrer">Ver PDF adjunto</a>
                            : 'No cargado'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )
                : <Typography color="text.secondary">No se adjuntaron documentos.</Typography>
              }
            </Paper>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">CERRAR</Button>
      </DialogActions>
    </Dialog>
  );
};

DetalleSolicitudAgente.propTypes = {};
