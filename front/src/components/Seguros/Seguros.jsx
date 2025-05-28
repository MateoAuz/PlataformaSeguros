"use client";
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { getSeguros, desactivarSeguro } from '../../services/SeguroService';
import { FormularioSeguro } from './FormularioSeguro/FormularioSeguro';
import BotonAccion from '../BotonAccion/BotonAccion';
import SeccionTitulo from '../SeccionTitulo/SeccionTitulo';
import ConfirmarDialogo from '../ConfirmarDialogo/ConfirmarDialogo';
import SegurosInactivos from './SegurosInactivos';

export const Seguros = () => {
  const [seguros, setSeguros] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seguroSeleccionado, setSeguroSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);

  const cargarSeguros = async () => {
    try {
      const res = await getSeguros();
      setSeguros(res.data);
    } catch (err) {
      console.error('Error al cargar seguros:', err);
    }
  };

  useEffect(() => {
    cargarSeguros();
  }, []);

  const handleAgregar = () => {
    setSeguroSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditar = (seguro) => {
    setSeguroSeleccionado(seguro);
    setModalAbierto(true);
  };

  const solicitarDesactivacion = (id) => {
    setIdParaDesactivar(id);
    setDialogoAbierto(true);
  };

  const confirmarDesactivacion = async () => {
    try {
      await desactivarSeguro(idParaDesactivar);
      cargarSeguros();
    } catch (err) {
      console.error('Error al desactivar seguro:', err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', px: { xs: 1, sm: 2, md: 4 }, py: 2 }}>
      <SeccionTitulo titulo="Gestión de Seguros">
        <BotonAccion texto="Nuevo Seguro" onClick={handleAgregar} />
      </SeccionTitulo>

      <SegurosInactivos />

      <Paper sx={{ p: { xs: 1, sm: 2 }, mt: 2, overflowX: 'auto', borderRadius: 2 }} elevation={2}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
            <TableRow>
              {[
                'Nombre',
                'Precio',
                'Tipo',
                'Tipo de Pago',
                'Cobertura',
                'Beneficios',
                'Documentos Requeridos',
                'Descripción',
                'Acciones'
              ].map((texto, idx) => (
                <TableCell
                  key={texto}
                  align={idx === 8 ? 'right' : 'center'}
                  sx={{ fontSize: '0.95rem', color: '#000000' }}
                >
                  {texto}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>


          <TableBody>
            {seguros.map((seguro, index) => (
              <TableRow
                key={seguro.id_seguro}
                sx={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fffaf4',
                  '&:hover': { backgroundColor: '#fff8f0', transition: '0.2s' }
                }}
              >
                <TableCell>{seguro.nombre}</TableCell>
                <TableCell>{seguro.precio}</TableCell>
                <TableCell>{seguro.tipo}</TableCell>
                <TableCell>{seguro.tiempo_pago}</TableCell>
                <TableCell>{seguro.cobertura}</TableCell>
                <TableCell>
                  {(seguro.beneficios || []).map(b => b.nombre).join(', ') || '—'}
                </TableCell>
                <TableCell>
                  {(seguro.requisitos || []).map(r => r.nombre).join(', ') || '—'}
                </TableCell>
                <TableCell>{seguro.descripcion}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEditar(seguro)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => solicitarDesactivacion(seguro.id_seguro)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <FormularioSeguro
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        seguro={seguroSeleccionado}
        onSuccess={cargarSeguros}
      />

      <ConfirmarDialogo
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        onConfirm={confirmarDesactivacion}
        mensaje="¿Estás seguro de que deseas desactivar este seguro?"
      />
    </Box>
  );

};

export default Seguros;
