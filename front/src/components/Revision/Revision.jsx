// src/components/Revision/RevisionReembolso.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  getSolicitudesReembolsos,
  getDetalleReembolso,
  aprobarReembolso,
  rechazarReembolso
} from '../../services/ReembolsoService';
import { BotonVerArchivo } from '../../components/BotonVerArchivo';

export const Revision = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    getSolicitudesReembolsos()
      .then(res => setSolicitudes(res.data))
      .catch(() => alert('Error cargando solicitudes'))
      .finally(() => setLoading(false));
  }, []);

  const verDetalle = async id => {
    try {
      const res = await getDetalleReembolso(id);
      setDetalle(res.data);
      setDialogOpen(true);
    } catch {
      alert('Error al cargar detalle');
    }
  };

  const decidir = async (id, accion) => {
    try {
      if (accion === 'aprobar') await aprobarReembolso(id);
      else await rechazarReembolso(id);
      const res = await getSolicitudesReembolsos();
      setSolicitudes(res.data);
    } catch {
      alert('Error al procesar decisión');
    }
  };

  if (loading) {
    return <CircularProgress sx={{ mt: 4 }} />;
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Revisión de Reembolsos
      </Typography>

      {solicitudes.length === 0 ? (
        <Typography>No hay solicitudes pendientes.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Seguro</strong></TableCell>
                <TableCell><strong>Motivo</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Acción</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.map(r => (
                <TableRow key={r.id_reembolso}>
                  <TableCell>{r.nombre_cliente} {r.apellido_cliente}</TableCell>
                  <TableCell>{r.nombre_seguro}</TableCell>
                  <TableCell>{r.motivo}</TableCell>
                  <TableCell>${parseFloat(r.monto).toFixed(2)}</TableCell>
                  <TableCell>{r.fecha_solicitud}</TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => verDetalle(r.id_reembolso)}
                      >
                        VER DETALLE
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={() => decidir(r.id_reembolso, 'aprobar')}
                      >
                        ACEPTAR
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => decidir(r.id_reembolso, 'rechazar')}
                      >
                        RECHAZAR
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detalle de Reembolso</DialogTitle>
        <DialogContent dividers>
          {!detalle ? (
            <Typography>Cargando…</Typography>
          ) : (
            <>
              <Typography><strong>Cliente:</strong> {detalle.cliente} {detalle.apellido}</Typography>
              <Typography><strong>Seguro:</strong> {detalle.seguro}</Typography>
              <Typography><strong>Motivo:</strong> {detalle.motivo}</Typography>
              <Typography><strong>Monto:</strong> ${parseFloat(detalle.monto_solicitado).toFixed(2)}</Typography>
              <Typography variant="h6" mt={2}>Documentos</Typography>
              {detalle.documentos.map((d, i) => (
                <Box key={i} mb={1}>
                  <BotonVerArchivo
                    rutaDescarga={`http://localhost:3030/reembolsos/${detalle.id_reembolso}/documento/${d.id_documento}`}
                  />
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Revision;
