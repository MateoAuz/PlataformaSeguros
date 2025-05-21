import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const ModalResumenSeguro = ({ open, onClose, seguro }) => {
  if (!seguro) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: '#0D2B81' }}>
        Resumen del Seguro
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1"><strong>Nombre:</strong> {seguro.nombre}</Typography>
        <Typography variant="subtitle1"><strong>Tipo:</strong> {seguro.tipo}</Typography>
        <Typography variant="subtitle1"><strong>Precio:</strong> {seguro.precio}</Typography>
        <Typography variant="subtitle1" sx={{ mt: 2 }}><strong>Descripción:</strong></Typography>
        <Typography variant="body2" color="text.secondary">{seguro.descripcion}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="primary">
          Contratar este seguro
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalResumenSeguro;
