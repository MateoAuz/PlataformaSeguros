"use client";
import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton, Chip, TextField, Select, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SeccionTitulo from '../SeccionTitulo/SeccionTitulo';
import BotonAccion from '../BotonAccion/BotonAccion';
import { FormularioCliente } from './FormularioCliente/FormularioCliente';
import ConfirmarDialogo from '../ConfirmarDialogo/ConfirmarDialogo';
import { getClientes, crearCliente, editarCliente, desactivarCliente, activarCliente } from '../../services/ClienteService';

export const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');

  const cargarClientes = async () => {
    try {
      const res = await getClientes();
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

  const handleRestaurar = async (id) => {
    try {
      await activarCliente(id);
      cargarClientes();
    } catch (err) {
      console.error('Error al restaurar cliente:', err);
    }
  };

  const handleGuardar = async (data) => {
    try {
      const datosCompletos = { ...data, tipo: 2 };
      if (clienteSeleccionado) {
        await editarCliente(clienteSeleccionado.id_usuario, datosCompletos);
      } else {
        await crearCliente(datosCompletos);
      }
      cargarClientes();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
    } finally {
      setModalAbierto(false);
    }
  };

  const solicitarDesactivacion = (id) => {
    setIdParaDesactivar(Number(id));
    setDialogoAbierto(true);
  };

  const confirmarDesactivacion = async () => {
    if (!idParaDesactivar || typeof idParaDesactivar !== 'number') {
      console.error('ID inválido para desactivar:', idParaDesactivar);
      return;
    }
    try {
      await desactivarCliente(idParaDesactivar);
      await cargarClientes();
    } catch (err) {
      console.error('Error al desactivar cliente:', err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  const filtrar = cliente => {
    const nombreMatch = cliente.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const estadoMatch = estadoFiltro === 'todos'
      || (estadoFiltro === 'activos' && cliente.estado === 1)
      || (estadoFiltro === 'inactivos' && cliente.estado === 0);
    return nombreMatch && estadoMatch;
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', px: 2, py: 2 }}>
      <SeccionTitulo titulo="Clientes Registrados">
        <BotonAccion texto="Nuevo Cliente" onClick={handleAgregar} />
      </SeccionTitulo>

        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
          <TextField
            label="Buscar por nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            displayEmpty
            sx={{ width: 200 }}
          >
            <MenuItem value="todos">Todos</MenuItem>
            <MenuItem value="activos">Activos</MenuItem>
            <MenuItem value="inactivos">Inactivos</MenuItem>
          </Select>
        </Box>


      <Paper elevation={2} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
            <TableRow>
              {['Nombre', 'Apellido', 'Correo', 'Username', 'Estado', 'Acciones'].map((label, i) => (
                <TableCell key={i}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.filter(filtrar).map((cliente) => (
              <TableRow key={cliente.id_usuario}>
                <TableCell>{cliente.nombre}</TableCell>
                <TableCell>{cliente.apellido}</TableCell>
                <TableCell>{cliente.correo}</TableCell>
                <TableCell>{cliente.username}</TableCell>
                <TableCell>
                  <Chip
                    label={cliente.estado === 1 ? 'Activo' : 'Inactivo'}
                    color={cliente.estado === 1 ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditar(cliente)}><EditIcon /></IconButton>
                  {cliente.estado === 1
                    ? <IconButton onClick={() => solicitarDesactivacion(cliente.id_usuario)}><DeleteIcon /></IconButton>
                    : <IconButton onClick={() => handleRestaurar(cliente.id_usuario)}><RestoreIcon /></IconButton>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
      </Paper>
      

      <FormularioCliente
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={handleGuardar}
        cliente={clienteSeleccionado}
      />

      <ConfirmarDialogo
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        onConfirm={confirmarDesactivacion}
        mensaje="¿Está seguro que desea desactivar este cliente?"
      />

    </Box>
  );
};

Clientes.propTypes = {};
