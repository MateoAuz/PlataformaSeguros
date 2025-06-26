// src/pages/Usuarios.jsx
"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useEffect, useState } from "react";
import {
  crearUsuario,
  desactivarUsuario,
  editarUsuario,
  getUsuarios,
} from "../../services/UserService";
import BotonAccion from "../BotonAccion/BotonAccion";
import ConfirmarDialogo from "../ConfirmarDialogo/ConfirmarDialogo";
import SeccionTitulo from "../SeccionTitulo/SeccionTitulo";
import { FormularioUsuario } from "./FormularioUsuario/FormularioUsuario";
import "./Usuarios.css";
import { UsuariosInactivos } from "./UsuariosInactivos/UsuariosInactivos";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [idParaDesactivar, setIdParaDesactivar] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("success");
  const [snackbarAbierto, setSnackbarAbierto] = useState(false);



  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const cargarUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
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
        setMensaje("Usuario actualizado correctamente.");
        setTipoMensaje("success");
        cargarUsuarios();
        return { success: true };
      } else {
        await crearUsuario(data);
        setMensaje("Usuario creado correctamente.");
        setTipoMensaje("success");
        cargarUsuarios();
        return { success: true };
      }
    } catch (err) {
      const detalle =
        err?.response?.data?.detalle || err?.response?.data?.error || err.message;
      setMensaje("Error al guardar usuario: " + detalle);
      setTipoMensaje("error");
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
      console.error("Error al desactivar usuario:", err);
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
      <SeccionTitulo titulo="Gestión de Usuarios">
        <BotonAccion texto="Nuevo Usuario" onClick={handleAgregar} />
      </SeccionTitulo>

      <UsuariosInactivos />

      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2 },
          mt: 2,
          borderRadius: 2,
        }}
      >
        {/* Contenedor con scroll horizontal si no caban todas las columnas */}
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#FFF3E0" }}>
                {[
                  "Nombre",
                  "Apellido",
                  "Correo",
                  "Username",
                  "Tipo",
                  "Acciones",
                ].map((texto, idx) => {
                  // Ocultar Username (idx=3) y Tipo (idx=4) en xs
                  const ocultarEnXs = (idx === 3 || idx === 4);
                  return (
                    <TableCell
                      key={texto}
                      align={idx === 5 ? "right" : "center"}
                      sx={{
                        fontSize: isXs ? "0.8rem" : "0.95rem",
                        color: "#000",
                        display: ocultarEnXs
                          ? { xs: "none", sm: "table-cell" }
                          : "table-cell",
                      }}
                    >
                      {texto}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {usuarios.map((usuario, index) => (
                <TableRow
                  key={usuario.id_usuario}
                  className="fila-hover"
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#fefefe",
                  }}
                >
                  <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                    {usuario.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                    {usuario.apellido}
                  </TableCell>
                  <TableCell sx={{ fontSize: isXs ? "0.8rem" : "0.9rem" }}>
                    {usuario.correo}
                  </TableCell>

                  {/* Username: oculto en xs */}
                  <TableCell
                    sx={{
                      fontSize: isXs ? "0.8rem" : "0.9rem",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {usuario.username}
                  </TableCell>

                  {/* Tipo: oculto en xs */}
                  <TableCell
                    sx={{
                      fontSize: isXs ? "0.8rem" : "0.9rem",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    <span className="tipo-texto">
                      {usuario.tipo === 0
                        ? "Administrador"
                        : usuario.tipo === 1
                        ? "Agente"
                        : "Cliente"}
                    </span>
                  </TableCell>

                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditar(usuario)}
                      size={isXs ? "small" : "medium"}
                    >
                      <EditIcon fontSize={isXs ? "small" : "medium"} />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => solicitarDesactivacion(usuario.id_usuario)}
                      size={isXs ? "small" : "medium"}
                    >
                      <DeleteIcon fontSize={isXs ? "small" : "medium"} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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

      <Snackbar
        open={snackbarAbierto}
        autoHideDuration={4000}
        onClose={() => setSnackbarAbierto(false)}
      >
        <MuiAlert
          onClose={() => setSnackbarAbierto(false)}
          severity={tipoMensaje}
          elevation={6}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {mensaje}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

Usuarios.propTypes = {};
