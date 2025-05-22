// src/components/Cliente/FormularioContratacion.jsx
"use client";
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Box,
  Grid,
  Typography,
  Divider,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import ClearIcon from '@mui/icons-material/Clear';
import { crearContrato } from '../../services/ContratoService';

const FormularioContratacion = ({ seguro, onVolver }) => {
  const [formData, setFormData] = useState({
    fecha: new Date(),
    hora: new Date(),
    beneficiario: '',
    modalidadPago: '',
    documentos: [],
    firma: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(fd => ({ ...fd, documentos: Array.from(files) }));
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };
  const handleDateChange = v => setFormData(fd => ({ ...fd, fecha: v }));
  const handleTimeChange = v => setFormData(fd => ({ ...fd, hora: v }));
  const clearField = f => setFormData(fd => ({ ...fd, [f]: f === 'documentos' ? [] : '' }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append('id_seguro', seguro.id_seguro);
    payload.append('beneficiario', formData.beneficiario);
    payload.append('modalidadPago', formData.modalidadPago);
    payload.append('fecha', formData.fecha.toISOString());
    payload.append('hora', formData.hora.toISOString());
    payload.append('firma', formData.firma);
    formData.documentos.forEach(file => {
      payload.append('documentos', file);
    });

    try {
      await crearContrato(payload);
      setSnackbar({ open: true, message: 'Contrato creado con éxito', severity: 'success' });
      setTimeout(onVolver, 1500);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al crear contrato', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 4 }}>
      {/* --- TÍTULO --- */}
      <Typography variant="h5" gutterBottom>
        Contratación de Seguro
      </Typography>
      <Typography variant="h6" color="primary" gutterBottom>
        {seguro.nombre}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* --- FORMULARIO --- */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* --- 1. DATOS DE CONTRATACIÓN --- */}
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={12} sm={10} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              1. Datos de contratación
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Fecha"
                  value={formData.fecha}
                  onChange={handleDateChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <IconButton size="small" onClick={() => clearField('fecha')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Hora"
                  value={formData.hora}
                  onChange={handleTimeChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <IconButton size="small" onClick={() => clearField('hora')}>
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
          </Grid>
        </Grid>

        {/* --- 2. BENEFICIARIO --- */}
        <Grid container justifyContent="center" spacing={1}>
          <Grid item xs={12} sm={10} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              2. Beneficiario
            </Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={11}>
                <TextField
                  fullWidth
                  name="beneficiario"
                  label="Nombre del beneficiario"
                  value={formData.beneficiario}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton onClick={() => clearField('beneficiario')}>
                  <ClearIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
          </Grid>
        </Grid>

        {/* --- 3. MODALIDAD DE PAGO --- */}
        <Grid container justifyContent="center" spacing={1}>
          <Grid item xs={12} sm={10} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              3. Modalidad de pago
            </Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={11}>
                <TextField
                  select
                  fullWidth
                  name="modalidadPago"
                  label="Selecciona modalidad"
                  value={formData.modalidadPago}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: '1rem'
                    }
                  }}
                >
                  <MenuItem value="mensual">Mensual</MenuItem>
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={1}>
                <IconButton onClick={() => clearField('modalidadPago')}>
                  <ClearIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
          </Grid>
        </Grid>

        {/* --- 4. DOCUMENTOS --- */}
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={12} sm={10} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              4. Documentos adjuntos
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              Subir documentos (PDF, imágenes)
              <input
                hidden
                type="file"
                name="documentos"
                multiple
                accept=".pdf,image/*"
                onChange={handleChange}
              />
            </Button>
            {formData.documentos.length > 0 && (
              <Box mt={1} display="flex" alignItems="center">
                <Typography variant="body2" mr={2}>
                  {formData.documentos.map(f => f.name).join(', ')}
                </Typography>
                <IconButton onClick={() => clearField('documentos')}>
                  <ClearIcon />
                </IconButton>
              </Box>
            )}
            <Divider sx={{ my: 3 }} />
          </Grid>
        </Grid>

        {/* --- 5. FIRMA ELECTRÓNICA --- */}
        <Typography variant="subtitle1" gutterBottom>
          5. Firma electrónica
        </Typography>
        <Grid container justifyContent="center" spacing={1} alignItems="center">
          <Grid item xs={11} sm={8} md={6}>
            <Box display="flex" alignItems="center">
              <TextField
                fullWidth
                name="firma"
                label="Escribe tu nombre completo"
                value={formData.firma}
                onChange={handleChange}
                required
              />
              <IconButton onClick={() => clearField('firma')}>
                <ClearIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* --- BOTONES --- */}
        <Box display="flex" justifyContent="space-between">
          <Button variant="text" onClick={onVolver}>
            ← Volver a lista
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Enviando...' : 'Firmar y contratar'}
          </Button>
        </Box>
      </Box>

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

FormularioContratacion.propTypes = {
  seguro: PropTypes.object.isRequired,
  onVolver: PropTypes.func.isRequired,
};

export default FormularioContratacion;
