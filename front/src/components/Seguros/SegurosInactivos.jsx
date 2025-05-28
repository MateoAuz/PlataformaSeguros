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
import { getSegurosInactivos, activarSeguro } from '../../services/SeguroService';
import ConfirmarDialogo from '../../components/ConfirmarDialogo/ConfirmarDialogo';

export const SegurosInactivos = () => {
  const [seguros, setSeguros] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [seguroAActivar, setSeguroAActivar] = useState(null);

  const cargarInactivos = async () => {
    try {
      const res = await getSegurosInactivos();
      setSeguros(res.data);
    } catch (err) {
      console.error('Error al cargar seguros inactivos:', err);
    }
  };

  useEffect(() => {
    if (mostrar) {
      cargarInactivos();
    }
  }, [mostrar]);

  const solicitarActivacion = (id) => {
    setSeguroAActivar(id);
    setDialogoAbierto(true);
  };

  const confirmarActivacion = async () => {
    try {
      await activarSeguro(seguroAActivar);
      cargarInactivos();
    } catch (err) {
      console.error('Error al activar seguro:', err);
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
        {mostrar ? 'Ocultar seguros desactivados' : 'Mostrar seguros desactivados'}
      </Button>

      <Collapse in={mostrar}>
        <Paper sx={{ p: 2 }}>
          <List>
            {seguros.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                No hay seguros desactivados.
              </Typography>
            )}

            {seguros.map((seguro) => (
              <ListItem
                key={seguro.id_seguro}
                secondaryAction={
                  <IconButton edge="end" color="success" onClick={() => solicitarActivacion(seguro.id_seguro)}>
                    <RestoreIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={seguro.nombre} secondary={seguro.tipo} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Collapse>

      <ConfirmarDialogo
        open={dialogoAbierto}
        onClose={() => setDialogoAbierto(false)}
        onConfirm={confirmarActivacion}
        mensaje="¿Estás seguro de que deseas activar este seguro?"
      />
    </Box>
  );
};

export default SegurosInactivos;
