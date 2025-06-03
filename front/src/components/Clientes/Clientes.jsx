"use client";
import React, { useEffect, useState } from 'react';
import './Clientes.css';
import PropTypes from 'prop-types';
import {
  Box, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getClientes, crearCliente, editarCliente, desactivarCliente } from '../../services/ClienteService';
import SeccionTitulo from '../SeccionTitulo/SeccionTitulo';
import BotonAccion from '../BotonAccion/BotonAccion';
import { FormularioCliente } from './FormularioCliente/FormularioCliente';
import ConfirmarDialogo from '../ConfirmarDialogo/ConfirmarDialogo';
import ClientesPendientes from './ClientesPendientes/ClientesPendientes';

export const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);

const cargarClientes = async () => {
  try {
    const res = await getClientes();
    console.log("📦 Clientes recibidos desde backend:", res.data); // 👈 AGREGA ESTA LÍNEA
    setClientes(res.data);
  } catch (err) {
    console.error('Error al cargar clientes:', err);
  }
};


  useEffect(() => {
    cargarClientes();
  }, []);

  const handleAgregar = () => {
    setClienteSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalAbierto(true);
  };

  const handleGuardar = async (data) => {
    try {
      if (clienteSeleccionado) {
        await editarCliente(clienteSeleccionado.id_usuario, data);
      } else {
        await crearCliente({ ...data, tipo: 2 });
      }
      cargarClientes();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    } finally {
      setModalAbierto(false);
    }
  };

  const solicitarDesactivacion = (id) => {
    setIdParaDesactivar(id);
    setDialogoAbierto(true);
  };

  const confirmarDesactivacion = async () => {
    try {
      await desactivarCliente(idParaDesactivar);
      cargarClientes();
    } catch (err) {
      console.error('Error al desactivar cliente:', err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      <SeccionTitulo titulo="Clientes Registrados">
        <BotonAccion texto="Nuevo Cliente" onClick={handleAgregar} />
      </SeccionTitulo>

      <ClientesPendientes onCrear={cargarClientes} />

      <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mt: 2, borderRadius: 2 }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
            <TableRow>
              {[ 'Nombre', 'Apellido', 'Correo', 'Username', 'Estado', 'Acciones' ].map((label, i) => (
                <TableCell key={i}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id_usuario}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.apellido}</TableCell>
                <TableCell>{cliente.correo}</TableCell>
                <TableCell>{cliente.username}</TableCell>
                <TableCell>
                  <Chip label={cliente.estado === 1 ? 'Activo' : 'Inactivo'} color={cliente.estado === 1 ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditar(cliente)}><EditIcon /></IconButton>
                  <IconButton onClick={() => solicitarDesactivacion(cliente.id_usuario)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <FormularioCliente
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardar}
        cliente={clienteSeleccionado}
      />

      <ConfirmarDialogo
        abierto={dialogoAbierto}
        onCerrar={() => setDialogoAbierto(false)}
        onConfirmar={confirmarDesactivacion}
        mensaje="¿Está seguro que desea desactivar este cliente?"
      />
    </Box>
  );
};

Clientes.propTypes = {};