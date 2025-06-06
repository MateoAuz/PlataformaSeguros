// src/pages/Seguros/Seguros.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getSeguros, desactivarSeguro } from "../../services/SeguroService";
import { FormularioSeguro } from "./FormularioSeguro/FormularioSeguro";
import BotonAccion from "../BotonAccion/BotonAccion";
import SeccionTitulo from "../SeccionTitulo/SeccionTitulo";
import ConfirmarDialogo from "../ConfirmarDialogo/ConfirmarDialogo";
import SegurosInactivos from "./SegurosInactivos";

export const Seguros = () => {
  const [seguros, setSeguros] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seguroSeleccionado, setSeguroSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Carga inicial y recarga de la lista de seguros activos
  const cargarSeguros = async () => {
    try {
      const res = await getSeguros();
      setSeguros(res.data);
    } catch (err) {
      console.error("Error al cargar seguros:", err);
    }
  };

  useEffect(() => {
    cargarSeguros();
  }, []);

  // Abre el modal en modo "crear" (sin selección previa)
  const handleAgregar = () => {
    setSeguroSeleccionado(null);
    setModalAbierto(true);
  };

  // Abre el modal en modo "editar" con el objeto seleccionado
  const handleEditar = (seguro) => {
    setSeguroSeleccionado(seguro);
    setModalAbierto(true);
  };

  // Solicita confirmación para desactivar
  const solicitarDesactivacion = (id) => {
    setIdParaDesactivar(id);
    setDialogoAbierto(true);
  };

  // Confirma la desactivación y recarga
  const confirmarDesactivacion = async () => {
    try {
      await desactivarSeguro(idParaDesactivar);
      cargarSeguros();
    } catch (err) {
      console.error("Error al desactivar seguro:", err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        px: { xs: 1, sm: 2, md: 4 },
        py: 2,
      }}
    >
      {/* Título y botón de nuevo seguro */}
      <SeccionTitulo titulo="Gestión de Seguros">
        <BotonAccion texto="Nuevo Seguro" onClick={handleAgregar} />
      </SeccionTitulo>

      {/* Lista de seguros inactivos si aplica */}
      <SegurosInactivos />

      {/* Tabla de seguros activos */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2 },
          mt: 2,
          overflowX: "auto",
          borderRadius: 2,
        }}
      >
        <Table sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: "#FFF3E0" }}>
            <TableRow>
              {[
                "Nombre",
                "Precio",
                "Tipo",
                "Tipo de Pago",
                "Cobertura",
                "Beneficios",
                "Documentos Requeridos",
                "Descripción",
                "Acciones",
              ].map((texto, idx) => (
                <TableCell
                  key={texto}
                  align={idx === 8 ? "right" : "center"}
                  sx={{
                    fontSize: isXs ? "0.8rem" : "0.95rem",
                    color: "#000",
                  }}
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
                  backgroundColor:
                    index % 2 === 0 ? "#ffffff" : "#fffaf4",
                  "&:hover": {
                    backgroundColor: "#fff8f0",
                    transition: "0.2s",
                  },
                }}
              >
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {seguro.nombre}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  ${seguro.precio}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {seguro.tipo}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {seguro.tiempo_pago}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {seguro.cobertura}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {(seguro.beneficios || [])
                    .map((b) => b.nombre)
                    .join(", ") || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {(seguro.requisitos || [])
                    .map((r) => r.nombre)
                    .join(", ") || "—"}
                </TableCell>
                <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                  {seguro.descripcion}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditar(seguro)}
                    size={isXs ? "small" : "medium"}
                  >
                    <EditIcon fontSize={isXs ? "small" : "medium"} />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => solicitarDesactivacion(seguro.id_seguro)}
                    size={isXs ? "small" : "medium"}
                  >
                    <DeleteIcon fontSize={isXs ? "small" : "medium"} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal para crear/editar */}
      <FormularioSeguro
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        seguro={seguroSeleccionado}
        onSuccess={cargarSeguros}
      />

      {/* Dialogo de confirmación para desactivar */}
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
