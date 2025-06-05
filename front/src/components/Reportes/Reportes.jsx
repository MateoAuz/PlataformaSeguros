"use client";
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { getContratosAceptados, getDetalleContratoSimple } from '../../services/ContratoService';

export const Reportes = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleContrato, setDetalleContrato] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    getContratosAceptados()
      .then(res => setContratos(res.data))
      .catch(err => console.error('Error al cargar contratos:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (id) => {
  getDetalleContratoSimple(id)
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81" fontWeight="bold">
        Reporte de Contratos Aceptados
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : contratos.length === 0 ? (
        <Typography>No hay contratos aceptados aún.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
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
              {contratos.map((c) => (
                <TableRow key={c.id_usuario_seguro}>
                  <TableCell>{c.nombre_usuario} {c.apellido_usuario}</TableCell>
                  <TableCell>{c.nombre_seguro}</TableCell>
                  <TableCell>{c.tipo}</TableCell>
                  <TableCell>{c.modalidad_pago}</TableCell>
                  <TableCell>{c.fecha_contrato}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleOpen(c.id_usuario_seguro)}>
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de detalles */}
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del Contrato</DialogTitle>
        <DialogContent dividers>
          {detalleContrato ? (
            <>
              <Typography><strong>Seguro:</strong> {detalleContrato.nombre_seguro}</Typography>
              <Typography><strong>Tipo:</strong> {detalleContrato.tipo}</Typography>
              <Typography><strong>Precio:</strong> ${detalleContrato.precio}</Typography>
              <Typography><strong>Modalidad de pago:</strong> {detalleContrato.modalidad_pago}</Typography>
              <Typography><strong>Cobertura:</strong> ${detalleContrato.cobertura}</Typography>

              <Typography sx={{ mt: 2 }}><strong>Beneficios:</strong></Typography>
              <ul>
                {detalleContrato.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>

              <Typography sx={{ mt: 2 }}><strong>Beneficiarios:</strong></Typography>
              <ul>
                {detalleContrato.beneficiarios?.map((b, i) => (
                  <li key={i}>{b.nombre} – {b.parentesco}</li>
                ))}
              </ul>

              <Typography sx={{ mt: 2 }}><strong>Documentos requeridos:</strong></Typography>
              <ul>
                {detalleContrato.requisitos?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>

              <Typography sx={{ mt: 2 }}><strong>Firma electrónica:</strong></Typography>
              <a href={`http://localhost:3030/${detalleContrato.firma}`} target="_blank" rel="noreferrer">
                Ver firma
              </a>
            </>
          ) : (
            <Typography>Cargando detalles...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
