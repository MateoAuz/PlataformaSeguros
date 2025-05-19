"use client";
import React from 'react';
import './ConfirmarDialogo.css';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ConfirmarDialogo = ({ open, onClose, onConfirm, mensaje }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirmar acción</DialogTitle>
    <DialogContent>{mensaje}</DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onConfirm} color="error" variant="contained">Confirmar</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmarDialogo;