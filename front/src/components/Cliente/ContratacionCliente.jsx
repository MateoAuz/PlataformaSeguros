import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'; // Escudo Material UI
import { getSegurosDisponibles } from '../../services/SeguroService';
import FormularioContratacion from './FormularioContratacion';

// Utilidad para obtener ID de usuario
function getIdUsuarioLocalStorage() {
  let id = localStorage.getItem("usuario_id");
  if (id && id !== "null" && id !== "") return id;
  let usuarioObj = localStorage.getItem("usuario");
  if (usuarioObj) {
    try {
      const usuario = JSON.parse(usuarioObj);
      return usuario.id_usuario;
    } catch { return null; }
  }
  return null;
}

export const ContratacionCliente = () => {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    const id_usuario = getIdUsuarioLocalStorage();
    if (!id_usuario) {
      setLoading(false);
      return;
    }
    getSegurosDisponibles(id_usuario)
      .then(res => {
        setSeguros(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener datos:', err);
        setLoading(false);
      });
  }, []);
  if (loading) {
    return <CircularProgress sx={{ mt: 5 }} />;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 4 } }}>
      <Typography variant="h4" gutterBottom color="#0D2B81" fontWeight="bold">
        Contratación de Seguros
      </Typography>
      <Typography variant="body1" mb={4}>
        Selecciona un seguro para ver más detalles y proceder con la contratación.
      </Typography>
      {!seleccionado ? (
        seguros.length === 0 ? (
          <Typography color="text.secondary">
            No hay seguros disponibles para contratar. Ya tienes contratados todos los seguros activos o pendientes.
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {seguros.map(seguro => (
              <Grid item xs={12} sm={6} md={4} key={seguro.id_seguro}>
                <Card
                  elevation={4}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                      <ShieldOutlinedIcon sx={{ color: '#0D2B81', fontSize: 42, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold" color="#0D2B81">
                        {seguro.nombre}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 1 }} />
                    <Typography align="center" color="text.secondary">
                      <b>Tipo:</b> {seguro.tipo}
                    </Typography>
                    <Typography align="center" color="text.secondary">
                      <b>Precio:</b> ${seguro.precio}
                    </Typography>
                    <Typography align="center" sx={{ mt: 1 }}>
                      {seguro.descripcion}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography fontSize={15} mb={1}>
                      <b>Cobertura:</b> ${seguro.cobertura}
                    </Typography>
                    <Typography fontSize={14} mb={1}>
                      <b>Beneficios:</b> {Array.isArray(seguro.beneficios)
                        ? seguro.beneficios.map(b => b.nombre).join(', ')
                        : 'No definidos'}
                    </Typography>
                    <Typography fontSize={14}>
                      <b>Requisitos:</b> {Array.isArray(seguro.requisitos)
                        ? seguro.requisitos.map(r => r.nombre).join(', ')
                        : 'No definidos'}
                    </Typography>
                  </CardContent>
                  <Box flexGrow={1} />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(90deg, #0D2B81 0%, #1565c0 100%)',
                      color: '#fff',
                      borderRadius: '0 0 16px 16px',
                      fontWeight: 'bold',
                      fontSize: 16,
                      mt: 2,
                      boxShadow: 2,
                      '&:hover': { background: 'linear-gradient(90deg,#1565c0 0%, #0D2B81 100%)' }
                    }}
                    onClick={() => setSeleccionado(seguro)}
                  >
                    CONTRATAR
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <FormularioContratacion
          seguro={seleccionado}
          onVolver={() => setSeleccionado(null)}
        />
      )}
    </Box>
  );
};

ContratacionCliente.propTypes = {};
