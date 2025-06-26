// src/components/Bienvenida/Bienvenida.jsx
"use client";
import { Alert, Box, Grid, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { contarClientes, crearUsuario } from '../../services/UserService';
import BotonAccion from '../BotonAccion/BotonAccion';
import { FormularioUsuario } from '../Usuarios/FormularioUsuario/FormularioUsuario';
import './Bienvenida.css';
import { contarSegurosActivos } from '../../services/SeguroService';
import { contarContratacionesPendientes } from '../../services/UserService';


export const Bienvenida = () => {
  const { usuario } = useContext(UserContext);
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalSegurosActivos, setTotalSegurosActivos] = useState(0);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);



  const fechaActual = new Date().toLocaleDateString();
  const horaActual = new Date().toLocaleTimeString();

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const res = await contarClientes();
        setTotalClientes(res.data.total);
      } catch (err) {
        console.error('❌ Error al contar clientes:', err);
      }
    };

    const obtenerSeguros = async () => {
      try {
        const res = await contarSegurosActivos();
        setTotalSegurosActivos(res.data.total);
      } catch (err) {
        console.error('❌ Error al contar seguros activos:', err);
      }
    };

    const obtenerPendientes = async () => {
      try {
        const res = await contarContratacionesPendientes();
        setTotalPendientes(res.data.total);
      } catch (err) {
        console.error('❌ Error al contar contrataciones pendientes:', err);
      }
    };

    // Ejecutar inicialmente
    obtenerClientes();
    obtenerSeguros();
    obtenerPendientes();

    // Refrescar cada 60 segundos
    const intervalo = setInterval(() => {
      obtenerClientes();
      obtenerSeguros();
      obtenerPendientes();
    }, 60000); // 60.000 ms = 60 segundos

    return () => clearInterval(intervalo); // Limpiar al desmontar
  }, []);


  const handleAgregar = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (nuevoUsuario) => {
    try {
      await crearUsuario(nuevoUsuario);
      setModalAbierto(false);
    } catch (err) {
      console.error('Error al crear usuario desde bienvenida:', err);
    }
  };

  return (
    <div className="bienvenida">
      <Typography variant="h4" gutterBottom>
        Bienvenido(a), {usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario'}
      </Typography>

      <Typography variant="body1" gutterBottom>
        Gracias por utilizar la plataforma <strong>Vida Plena</strong>. Aquí podrás gestionar seguros, clientes y más.
      </Typography>

      <Typography variant="body2" color="textSecondary" gutterBottom>
        {fechaActual} - {horaActual}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
            <Typography variant="h6" color="warning.main">Seguros activos</Typography>
            <Typography variant="h4" color="text.primary">{totalSegurosActivos}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
            <Typography variant="h6" color="warning.main">Clientes registrados</Typography>
            <Typography variant="h4" color="text.primary">{totalClientes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
            <Typography variant="h6" color="warning.main">Contrataciones pendientes</Typography>
            <Typography variant="h4" color="text.primary">{totalPendientes}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Accesos rápidos</Typography>
        {usuario?.tipo === 0 && (
          <BotonAccion texto="Nuevo Usuario" onClick={handleAgregar} sx={{ ml: 2 }} />
        )}

      </Box>

      <Alert severity="info" sx={{ mt: 4 }}>
        Tienes {totalPendientes} contrataciones pendientes de revisión.
      </Alert>


      <FormularioUsuario
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleGuardar}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};

export default Bienvenida;
