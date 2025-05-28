// src/components/Perfil/PerfilUsuario.jsx
"use client";
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../context/UserContext';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { editarUsuario, obtenerUsuarioPorId } from '../../services/UserService';

export const PerfilUsuario = () => {
  const { usuario, setUsuario } = useContext(UserContext);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const res = await obtenerUsuarioPorId(usuario.id_usuario);
        setFormData(res.data);
      } catch (err) {
        console.error('Error al obtener datos del perfil:', err);
      }
    };

    if (usuario?.id_usuario) {
      cargarUsuario();
    }
  }, [usuario?.id_usuario]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    try {
      await editarUsuario(usuario.id_usuario, formData);
      setUsuario(formData);
      setMensaje('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMensaje('Error al actualizar perfil');
    } finally {
      setOpenSnackbar(true);
      setEditando(false);
    }
  };

  if (!formData) return null;

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Perfil del Usuario
          </Typography>
          {!editando && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditando(true)}>
              Editar
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {editando ? (
          <Stack spacing={2}>
            <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth />
            <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} fullWidth />
            <TextField label="Username" name="username" value={formData.username} onChange={handleChange} fullWidth />
            <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="contained" onClick={handleGuardar}>Guardar</Button>
              <Button variant="outlined" onClick={() => setEditando(false)}>Cancelar</Button>
            </Box>
          </Stack>
        ) : (
          <>
            <Typography><strong>Nombre:</strong> {formData?.nombre || '---'}</Typography>
            <Typography><strong>Apellido:</strong> {formData?.apellido || '---'}</Typography>
            <Typography><strong>Correo:</strong> {formData?.correo || '---'}</Typography>
            <Typography><strong>Username:</strong> {formData?.username || '---'}</Typography>
            <Typography><strong>Cédula:</strong> {formData?.cedula || '---'}</Typography>
            <Typography><strong>Teléfono:</strong> {formData?.telefono || '---'}</Typography>
          </>
        )}
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>{mensaje}</Alert>
      </Snackbar>
    </Box>
  );
};

