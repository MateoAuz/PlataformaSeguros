// src/components/Cliente/ReembolsosCliente.jsx
"use client";
import React, { useState, useEffect, useContext } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { UserContext } from '../../context/UserContext';
import { createReembolso, fetchSegurosCliente, hasPendingReembolso } from '../../services/ReembolsoService';
import { SubirArchivo } from '../SubirArchivo';

const ReembolsosCliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [formData, setFormData] = useState({ contrato: '', motivo: '', monto: '', documentos: [null] });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
  if (!usuario?.id_usuario) return;
  fetchSegurosCliente(usuario.id_usuario)
    .then(async lista => {
      // Para cada seguro, chequeamos pendiente
      const arr = await Promise.all(
        lista.map(async s => {
          const { data } = await hasPendingReembolso(s.id_usuario_seguro);
          return { ...s, pendiente: data.pendiente };
        })
      );
      setSeguros(arr);
    })
    .catch(console.error);
}, [usuario]);


  const handleChange = (e, idx) => {
    const { name, value, files } = e.target;
    if (name === 'documento') {
      setFormData(fd => {
        const docs = [...fd.documentos];
        docs[idx] = files[0] || null;
        return { ...fd, documentos: docs };
      });
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  const addDocumento = () => setFormData(fd => ({ ...fd, documentos: [...fd.documentos, null] }));
  const removeDocumento = idx => setFormData(fd => {
    const docs = fd.documentos.filter((_, i) => i !== idx);
    return { ...fd, documentos: docs.length ? docs : [null] };
  });

  const handleSubmit = async e => {
    e.preventDefault();
    // 1) Compruebo pendiente para este contrato
  try {
    const { data } = await hasPendingReembolso(formData.contrato);
    if (data.pendiente) {
      return setSnackbar({
        open: true,
        message: 'Ya tienes una solicitud pendiente para este seguro.',
        severity: 'warning'
      });
    }
  } catch (err) {
    console.warn('No se pudo chequear pendientes, continuando…');
    // si da error en la comprobación, dejamos seguir para no bloquear TODO
  }
    const montoNum = parseFloat(formData.monto);
    if (isNaN(montoNum) || montoNum < 0) {
      setSnackbar({ open: true, message: 'El monto debe ser un número positivo.', severity: 'warning' });
      return;
    }
    if (!formData.contrato) {
      setSnackbar({ open: true, message: 'Selecciona un seguro.', severity: 'warning' });
      return;
    }
    if (!formData.motivo.trim() || !formData.monto) {
      setSnackbar({ open: true, message: 'Completa motivo y monto.', severity: 'warning' });
      return;
    }
    if (formData.documentos.some(d => !d)) {
      setSnackbar({ open: true, message: 'Adjunta todos los documentos.', severity: 'warning' });
      return;
    }

    const payload = new FormData();
    payload.append('id_usuario_seguro', formData.contrato);
    payload.append('motivo', formData.motivo);
    payload.append('monto', formData.monto);
    formData.documentos.forEach(file => payload.append('documentos', file));

    try {
      setLoading(true);
      await createReembolso(payload);
      setSnackbar({ open: true, message: 'Reembolso solicitado.', severity: 'success' });
      setFormData({ contrato: '', motivo: '', monto: '', documentos: [null] });
    } catch {
      setSnackbar({ open: true, message: 'Error al enviar solicitud.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Solicitud de Reembolso
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Selector de Seguro */}
        <Grid container spacing={2} alignItems="center">
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
            <FormControl sx={{ width: '100%', maxWidth: 800 }}>
              <InputLabel id="label-seguro">Seguro Contratado</InputLabel>
              <Select
                labelId="label-seguro"
                name="contrato"
                value={formData.contrato}
                onChange={handleChange}
                label="Seguro Contratado"
                sx={{ height: 56, borderRadius: 1 }}
              >
                {seguros.length === 0 ? (
                  <MenuItem value="" disabled>No tienes seguros</MenuItem>
                ) : (
                  seguros.map(s => (
                    <MenuItem
                      key={s.id_usuario_seguro}
                      value={s.id_usuario_seguro}
                      disabled={s.pendiente}
                    >
                      {s.nombre} {`- Cobertura: $${s.cobertura}`} {s.pendiente && '(Ya hay pendiente)'}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

        </Grid>

        {/* Motivo y Monto */}
        <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              name="motivo"
              label="Motivo *"
              placeholder="Describe el motivo"
              fullWidth
              variant="outlined"
              value={formData.motivo}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              name="monto"
              label="Monto (USD) *"
              type="number"
              fullWidth
              variant="outlined"
              inputProps={{ min: 0, step: '0.01' }}
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        {/* Documentos adjuntos con botón X */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            Documentos adjuntos *
          </Typography>
          {formData.documentos.map((doc, idx) => (
            <Box
              key={idx}
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ maxWidth: 200, mx: 'auto', mt: 1 }}
            >
              <SubirArchivo
                nombre={`Documento ${idx + 1}`}
                tipo="application/pdf,image/*"
                requerido
                fullWidth
                onArchivoSeleccionado={file => {
                  setFormData(fd => {
                    const docs = [...fd.documentos];
                    docs[idx] = file;
                    return { ...fd, documentos: docs };
                  });
                }}
              />
              <IconButton color="error" onClick={() => removeDocumento(idx)}>
                <ClearIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            fullWidth
            sx={{ maxWidth: 200, mx: 'auto', mt: 3 }}
            onClick={addDocumento}
          >
            + AÑADIR DOCUMENTO
          </Button>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ fontWeight: 'bold', py: 1.5 }}
            onClick={() => setFormData({ contrato: '', motivo: '', monto: '', documentos: [null] })}
          >
            LIMPIAR
          </Button>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ fontWeight: 'bold', py: 1.5 }}
          >
            {loading ? 'Enviando...' : 'ENVIAR SOLICITUD'}
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReembolsosCliente;
