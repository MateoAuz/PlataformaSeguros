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
import { createReembolso, fetchSegurosCliente } from '../../services/ReembolsoService';
import { SubirArchivo } from '../SubirArchivo';

const ReembolsosCliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [formData, setFormData] = useState({ contrato: '', motivo: '', monto: '', documentos: [null] });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (usuario?.id_usuario) {
      fetchSegurosCliente(usuario.id_usuario)
        .then(data => setSeguros(data))
        .catch(err => console.error('Error cargando seguros:', err));
    }
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
    const montoNum = parseFloat(formData.monto);
    if (isNaN(montoNum) || montoNum < 0) {
        setSnackbar({ open: true, message: 'El monto debe ser un número positivo.', severity: 'warning' });
        return;
    }
    if (!formData.contrato) return setSnackbar({ open: true, message: 'Selecciona un seguro.', severity: 'warning' });
    if (!formData.motivo.trim() || !formData.monto) return setSnackbar({ open: true, message: 'Completa motivo y monto.', severity: 'warning' });
    if (formData.documentos.some(d => !d)) return setSnackbar({ open: true, message: 'Adjunta todos los documentos.', severity: 'warning' });

    const payload = new FormData();
    payload.append('id_usuario_seguro', formData.contrato);
    payload.append('motivo', formData.motivo);
    payload.append('monto', formData.monto);
    formData.documentos.forEach(file =>
        payload.append('documentos', file)
    );

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
        {/* Fila: Selector + Motivo + Monto */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl sx={{ width: 380 }}>
              <InputLabel id="label-seguro">Seguro Contratado</InputLabel>
              <Select
                labelId="label-seguro"
                name="contrato"
                value={formData.contrato}
                onChange={handleChange}
                label="Seguro Contratado"
                sx={{ width: '200%', height: 56, borderRadius: 1 }}
              >
                {seguros.length === 0 ? (
                  <MenuItem value="" disabled>No tienes</MenuItem>
                ) : (
                  seguros.map(s => (
                    <MenuItem key={s.id_usuario_seguro} value={s.id_usuario_seguro}>
                      {`${s.nombre} - ${`Cobertura: $${s.cobertura}`}`}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
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
              inputProps={{ min: 0, step: '0.1' }}
              value={formData.monto}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>

        {/* Documentos adjuntos */}
<Box sx={{ mt: 3, textAlign: 'center' }}>
  <Typography variant="subtitle1" gutterBottom>
    Documentos adjuntos *
  </Typography>

  {formData.documentos.map((_, idx) => (
    <Box key={idx} sx={{ mb: 2 }}>
      <SubirArchivo
        nombre={`Documento ${idx + 1}`}
        tipo="application/pdf,image/*"
        requerido
        onArchivoSeleccionado={file => {
          setFormData(fd => {
            const docs = [...fd.documentos];
            docs[idx] = file;
            return { ...fd, documentos: docs };
          });
        }}
      />
    </Box>
  ))}

  <Button
    variant="outlined"
    fullWidth
    sx={{ maxWidth: 200, mx: 'auto', mt: 1 }}
    onClick={addDocumento}
  >
    + AÑADIR DOCUMENTO
  </Button>
</Box>

        {/* Botones Limpiar y Enviar con estilo de la imagen */}
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
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReembolsosCliente;
