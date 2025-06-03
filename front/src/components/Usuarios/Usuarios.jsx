// src/pages/Usuarios.jsx
"use client";
import React, { useEffect, useState } from 'react';
import './Usuarios.css';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  getUsuarios,
  crearUsuario,
  editarUsuario,
  desactivarUsuario
} from '../../services/UserService';
import { FormularioUsuario } from './FormularioUsuario/FormularioUsuario';
import { UsuariosInactivos } from './UsuariosInactivos/UsuariosInactivos';
import BotonAccion from '../BotonAccion/BotonAccion';
import SeccionTitulo from '../SeccionTitulo/SeccionTitulo';
import ConfirmarDialogo from '../ConfirmarDialogo/ConfirmarDialogo';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Chip } from '@mui/material';


export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  const [snackbarAbierto, setSnackbarAbierto] = useState(false);


  const cargarUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleAgregar = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
  };

  const handleGuardar = async (data) => {
    try {
      if (usuarioSeleccionado) {
        await editarUsuario(usuarioSeleccionado.id_usuario, data);
        setMensaje('Usuario actualizado correctamente.');
        setTipoMensaje('success');
        cargarUsuarios();
        return { success: true };
      } else {
        await crearUsuario(data);
        setMensaje('Usuario creado correctamente.');
        setTipoMensaje('success');
        cargarUsuarios();
        return { success: true };
      }
    } catch (err) {
      const detalle = err?.response?.data?.detalle || err?.response?.data?.error || err.message;
      setMensaje('Error al guardar usuario: ' + detalle);
      setTipoMensaje('error');
      return { success: false, error: detalle };
    } finally {
      setSnackbarAbierto(true);
    }
  };


  const solicitarDesactivacion = (id) => {
    setIdParaDesactivar(id);
    setDialogoAbierto(true);
  };

  const confirmarDesactivacion = async () => {
    try {
      await desactivarUsuario(idParaDesactivar);
      cargarUsuarios();
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      <SeccionTitulo titulo="Gestión de Usuarios">
        <BotonAccion texto="Nuevo Usuario" onClick={handleAgregar} />
      </SeccionTitulo>

      <UsuariosInactivos />

      <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mt: 2, borderRadius: 2 }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
            <TableRow>
              {[
                'Nombre',
                'Apellido',
                'Correo',
                'Username',
                'Tipo',
                'Acciones'
              ].map((texto, idx) => (
                <TableCell
                  key={texto}
                  align={idx === 5 ? 'right' : 'center'}
                  sx={{ fontSize: '0.95rem', color: '#000000' }}
                >
                  {texto}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {usuarios.map((usuario, index) => (
              <TableRow
                key={usuario.id_usuario}
                className="fila-hover"
                sx={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fefefe' }}
              >
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.apellido}</TableCell>
                <TableCell>{usuario.correo}</TableCell>
                <TableCell>{usuario.username}</TableCell>
                <TableCell>
                  <span className="tipo-texto">
                    {usuario.tipo === 0 ? 'Administrador' : usuario.tipo === 1 ? 'Agente' : 'Cliente'}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEditar(usuario)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => solicitarDesactivacion(usuario.id_usuario)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>


      <FormularioUsuario
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleGuardar}
        usuario={usuarioSeleccionado}
      />

      <ConfirmarDialogo
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        onConfirm={confirmarDesactivacion}
        mensaje="¿Estás seguro de que deseas desactivar este usuario?"
      />

      <Snackbar open={snackbarAbierto} autoHideDuration={4000} onClose={() => setSnackbarAbierto(false)}>
        <MuiAlert
          onClose={() => setSnackbarAbierto(false)}
          severity={tipoMensaje}
          elevation={6}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {mensaje}
        </MuiAlert>
      </Snackbar>

    </Box>
  );

};

Usuarios.propTypes = {};
