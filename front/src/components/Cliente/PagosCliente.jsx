"use client";
import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Select, MenuItem, InputLabel,
  FormControl, Button, TextField, Paper, Grid, Snackbar, Alert, Table, TableHead, TableRow, TableCell, TableBody, TableContainer
} from '@mui/material';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

const PagosCliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [alerta, setAlerta] = useState({ open: false, tipo: 'success' });

  useEffect(() => {
    if (usuario?.id_usuario) {
      axios.get(`http://localhost:3030/contratos/cliente/${usuario.id_usuario}`)
        .then(res => setSeguros(res.data))
        .catch(err => console.error('Error cargando seguros:', err));

      axios.get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`)
        .then(res => setPagos(res.data))
        .catch(err => console.error('Error cargando pagos:', err));
    }
  }, [usuario]);

  const handlePagoSubmit = async (e) => {
    e.preventDefault();
    if (!contratoSeleccionado || !cantidad || !archivo) {
      setMensaje('Todos los campos son obligatorios.');
      setAlerta({ open: true, tipo: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('id_usuario_seguro_per', contratoSeleccionado);
    formData.append('cantidad', cantidad);
    formData.append('comprobante', archivo);

    try {
      const res = await axios.post('http://localhost:3030/pagos', formData);
      setMensaje(res.data.mensaje || 'Pago registrado');
      setAlerta({ open: true, tipo: 'success' });
      setCantidad('');
      setArchivo(null);

      // recargar pagos
      const pagosAct = await axios.get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`);
      setPagos(pagosAct.data);
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al registrar pago');
      setAlerta({ open: true, tipo: 'error' });
    }
  };

  const verComprobante = async (rutaS3) => {
    try {
      const res = await axios.get(`http://localhost:3030/uploads/descarga/${encodeURIComponent(rutaS3)}`);
      window.open(res.data.url, '_blank');
    } catch (err) {
      setMensaje('Error al cargar el comprobante');
      setAlerta({ open: true, tipo: 'error' });
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      <Typography variant="h4" gutterBottom align="center">Pagos de Seguros</Typography>

      {/* Selector de contrato */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Seguro contratado</InputLabel>
        <Select
          value={contratoSeleccionado}
          label="Seguro contratado"
          onChange={(e) => setContratoSeleccionado(e.target.value)}
        >
          {seguros.map((s) => (
            <MenuItem key={s.id_usuario_seguro} value={s.id_usuario_seguro}>
              {s.nombre} - {s.modalidad_pago} (${s.precio})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Formulario */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Registrar nuevo pago</Typography>
        <form onSubmit={handlePagoSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                label="Monto pagado"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="contained" component="label" fullWidth>
                Subir comprobante
                <input type="file" hidden onChange={(e) => setArchivo(e.target.files[0])} />
              </Button>
              {archivo && (
                <Typography mt={1} sx={{ fontSize: 13, wordBreak: 'break-word' }}>{archivo.name}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Enviar pago
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Historial */}
      <Typography variant="h6" mt={5} mb={1}>Historial de pagos</Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Seguro</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Comprobante</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id_pago_seguro}>
                <TableCell>{pago.nombre}</TableCell>
                <TableCell>{pago.fecha_pago}</TableCell>
                <TableCell>${pago.cantidad.toFixed(2)}</TableCell>
                <TableCell sx={{ color: pago.cantidad >= pago.precio ? 'green' : 'red' }}>
                  {pago.cantidad >= pago.precio ? 'Correcto' : 'Monto insuficiente'}
                </TableCell>
                <TableCell>
                  <Button variant="text" onClick={() => verComprobante(pago.comprobante_pago)}>
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={alerta.open}
        autoHideDuration={5000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={alerta.tipo} variant="filled">
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagosCliente;
