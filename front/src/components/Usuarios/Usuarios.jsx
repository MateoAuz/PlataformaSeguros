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

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);

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
      } else {
        await crearUsuario(data);
      }
      cargarUsuarios();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
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
    <div className="usuarios">
      <SeccionTitulo titulo="Gestión de Usuarios">
        <BotonAccion texto="Nuevo Usuario" onClick={handleAgregar} />
      </SeccionTitulo>

      <UsuariosInactivos />

      <Paper sx={{ p: 2, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id_usuario}>
                <TableCell>{usuario.nombre}</TableCell>
                <TableCell>{usuario.apellido}</TableCell>
                <TableCell>{usuario.correo}</TableCell>
                <TableCell>{usuario.username}</TableCell>
                <TableCell>
                  {usuario.tipo === 0 ? 'Administrador' : usuario.tipo === 1 ? 'Agente' : 'Cliente'}
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
    </div>
  );
};

Usuarios.propTypes = {};
