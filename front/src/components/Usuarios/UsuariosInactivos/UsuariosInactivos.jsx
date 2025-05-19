// src/components/Usuarios/UsuariosInactivos/UsuariosInactivos.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Collapse,
  Button
} from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getUsuariosInactivos, activarUsuario } from '../../../services/UserService';
import ConfirmarDialogo from '../../ConfirmarDialogo/ConfirmarDialogo';

export const UsuariosInactivos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [usuarioAActivar, setUsuarioAActivar] = useState(null);

  const cargarInactivos = async () => {
    try {
      const res = await getUsuariosInactivos();
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios inactivos:', err);
    }
  };

  useEffect(() => {
    if (mostrar) {
      cargarInactivos();
    }
  }, [mostrar]);

  const solicitarActivacion = (id) => {
    setUsuarioAActivar(id);
    setDialogoAbierto(true);
  };

  const confirmarActivacion = async () => {
    try {
      await activarUsuario(usuarioAActivar);
      cargarInactivos();
    } catch (err) {
      console.error('Error al activar usuario:', err);
    } finally {
      setDialogoAbierto(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Button
        variant="outlined"
        onClick={() => setMostrar(!mostrar)}
        endIcon={mostrar ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mb: 2 }}
      >
        {mostrar ? 'Ocultar usuarios desactivados' : 'Mostrar usuarios desactivados'}
      </Button>

      <Collapse in={mostrar}>
        <Paper sx={{ p: 2 }}>
          <List>
            {usuarios.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No hay usuarios desactivados.
              </Typography>
            )}

            {usuarios.map((usuario) => (
              <ListItem
                key={usuario.id_usuario}
                secondaryAction={
                  <IconButton edge="end" color="success" onClick={() => solicitarActivacion(usuario.id_usuario)}>
                    <RestoreIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={`${usuario.nombre} ${usuario.apellido}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      <ConfirmarDialogo
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        onConfirm={confirmarActivacion}
        mensaje="¿Estás seguro de que deseas activar este usuario?"
      />
    </Box>
  );
};

export default UsuariosInactivos;
