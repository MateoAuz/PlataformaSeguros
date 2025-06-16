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
  DialogActions,
  TextField,
  Snackbar, 
  Alert
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
  const [rechazoOpen, setRechazoOpen] = useState(false);
  const [idRechazar, setIdRechazar]   = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'info'
});



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
                        onClick={async () => {
                          try {
                            await aprobarReembolso(r.id_reembolso);
                            const res = await getSolicitudesReembolsos();
                            setSolicitudes(res.data);
                            setSnackbar({ open: true, message: 'Reembolso aprobado', severity: 'success' });
                          } catch {
                            setSnackbar({ open: true, message: 'Error al aprobar', severity: 'error' });
                          }
                        }}
                      >
                        ACEPTAR
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                          onClick={() => {
                          setIdRechazar(r.id_reembolso);
                          setMotivoRechazo('');
                          setRechazoOpen(true);
                        }}
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

      {/* —————————— Diálogo de motivo de rechazo —————————— */}
<Dialog open={rechazoOpen} onClose={() => setRechazoOpen(false)}>
  <DialogTitle>¿Por qué rechazas esta solicitud?</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Motivo de rechazo"
      type="text"
      fullWidth
      multiline
      minRows={2}
      value={motivoRechazo}
      onChange={e => setMotivoRechazo(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setRechazoOpen(false)}>Cancelar</Button>
    <Button
      color="error"
      variant="contained"
      onClick={async () => {
        try {
          await rechazarReembolso(idRechazar, motivoRechazo);
          // refresca lista
          const res = await getSolicitudesReembolsos();
          setSolicitudes(res.data);
          setSnackbar({ open: true, message: 'Reembolso rechazado', severity: 'success' });
        } catch {
          setSnackbar({ open: true, message: 'Error al rechazar', severity: 'error' });
        } finally {
          setRechazoOpen(false);
        }
      }}
    >
      Confirmar
    </Button>
  </DialogActions>
</Dialog>


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
                <Box
                  key={i}
                  display="flex"
                  alignItems="center"
                gap={1}
                  mb={1}
                >
                  {/* Mostrar el nombre del archivo */}
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    {d.nombre_archivo}
                  </Typography>
                  {/* Botón de descarga */}
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

      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() => setSnackbar(s => ({ ...s, open: false }))}
>
  <Alert
    onClose={() => setSnackbar(s => ({ ...s, open: false }))}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>


    </Box>
  );
};

export default Revision;
