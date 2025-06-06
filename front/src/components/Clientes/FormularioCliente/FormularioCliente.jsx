"use client";
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from '@mui/material';

export const FormularioCliente = ({ abierto, onCerrar, onGuardar, cliente }) => {
  console.log("✅ cliente.rutas.js cargado correctamente");

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', correo: '', username: '',
    password: '', cedula: '', telefono: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        correo: cliente.correo || '',
        username: cliente.username || '',
        password: '',
        cedula: cliente.cedula || '',
        telefono: cliente.telefono || ''
      });
    } else {
      setFormData({ nombre: '', apellido: '', correo: '', username: '', password: '', cedula: '', telefono: '' });
    }
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const cleanedData = {
    ...formData,
    nombre: formData.nombre.trim(),
    apellido: formData.apellido.trim(),
    correo: formData.correo.trim(),
    username: formData.username.trim(),
    password: formData.password.trim(),
    cedula: formData.cedula.trim(),
    telefono: formData.telefono.trim(),
    };

    // Validaciones básicas (puedes mejorar esto con regex si deseas)
    if (!/^\d+$/.test(cleanedData.cedula)) {
      alert('La cédula debe contener solo números');
      return;
    }

    if (!/^\d+$/.test(cleanedData.telefono)) {
      alert('El teléfono debe contener solo números');
      return;
    }
      onGuardar(cleanedData);
      onCerrar();
  };

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} fullWidth />
          <TextField name="apellido" label="Apellido" value={formData.apellido} onChange={handleChange} fullWidth />
          <TextField name="correo" label="Correo" value={formData.correo} onChange={handleChange} fullWidth />
          <TextField name="username" label="Usuario" value={formData.username} onChange={handleChange} fullWidth />
          <TextField name="password" label="Contraseña" type="password" value={formData.password} onChange={handleChange} fullWidth />
          <TextField name="cedula" label="Cédula" value={formData.cedula} onChange={handleChange} fullWidth />
          <TextField name="telefono" label="Teléfono" value={formData.telefono} onChange={handleChange} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {cliente ? 'Guardar Cambios' : 'Crear Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FormularioCliente.propTypes = {
  abierto: PropTypes.bool.isRequired,
  onCerrar: PropTypes.func.isRequired,
  onGuardar: PropTypes.func.isRequired,
  cliente: PropTypes.object
};
