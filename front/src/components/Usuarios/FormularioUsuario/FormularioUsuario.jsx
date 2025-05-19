import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem
} from '@mui/material';
import { obtenerUsuarioPorId } from '../../../services/UserService';

const tipos = [
  { value: 0, label: 'Administrador' },
  { value: 1, label: 'Agente' },
  { value: 2, label: 'Cliente' },
];

export const FormularioUsuario = ({ open, onClose, onSubmit, usuario }) => {
  const [formData, setFormData] = useState(null);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const cargarUsuario = async () => {
      if (usuario && usuario.id_usuario) {
        try {
          const res = await obtenerUsuarioPorId(usuario.id_usuario);
          setFormData(res.data);
        } catch (error) {
          console.error('Error al cargar usuario desde base de datos:', error);
        }
      } else {
        setFormData({
          nombre: '', apellido: '', correo: '', username: '', password: '',
          tipo: 2, cedula: '', telefono: ''
        });
      }
    };

    if (open) cargarUsuario();
  }, [usuario, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validar = () => {
    const errores = {};

    if (!formData.nombre.trim()) errores.nombre = 'Nombre requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) errores.nombre = 'Solo letras';

    if (!formData.apellido.trim()) errores.apellido = 'Apellido requerido';
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.apellido)) errores.apellido = 'Solo letras';

    if (!formData.correo.trim()) errores.correo = 'Correo requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) errores.correo = 'Correo inválido';

    if (!formData.username.trim()) errores.username = 'Usuario requerido';
    if (!formData.password.trim()) errores.password = 'Contraseña requerida';

    if (!formData.cedula.trim()) errores.cedula = 'Cédula requerida';
    else if (!/^\d{10}$/.test(formData.cedula)) errores.cedula = 'Debe tener 10 dígitos';

    if (!formData.telefono.trim()) errores.telefono = 'Teléfono requerido';
    else if (!/^\d{10}$/.test(formData.telefono)) errores.telefono = 'Debe tener 10 dígitos';

    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    onSubmit(formData);
    onClose();
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{usuario ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField fullWidth label="Nombre" name="nombre" value={formData.nombre}
              onChange={handleChange} error={!!errores.nombre} helperText={errores.nombre} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Apellido" name="apellido" value={formData.apellido}
              onChange={handleChange} error={!!errores.apellido} helperText={errores.apellido} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Correo" name="correo" value={formData.correo}
              onChange={handleChange} error={!!errores.correo} helperText={errores.correo} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Usuario" name="username" value={formData.username}
              onChange={handleChange} error={!!errores.username} helperText={errores.username} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Contraseña" type="password" name="password" value={formData.password}
              onChange={handleChange} error={!!errores.password} helperText={errores.password} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Cédula" name="cedula" value={formData.cedula}
              onChange={handleChange} error={!!errores.cedula} helperText={errores.cedula} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono}
              onChange={handleChange} error={!!errores.telefono} helperText={errores.telefono} />
          </Grid>
          <Grid item xs={12}>
            <TextField select fullWidth label="Tipo de usuario" name="tipo" value={formData.tipo}
              onChange={handleChange}>
              {tipos.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};
