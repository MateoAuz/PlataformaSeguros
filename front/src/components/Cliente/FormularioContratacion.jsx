"use client";
import React, { useState, useEffect } from 'react';
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
import { getRequisitosPorSeguro } from '../../services/RequisitoService';

const FormularioContratacion = ({ seguro, onVolver }) => {
  const [formData, setFormData] = useState({
    fecha: new Date(),
    hora: new Date(),
    beneficiario: '',
    modalidadPago: '',
    documentos: [],
    firma: ''
  });
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [requisitos, setRequisitos] = useState([]);
  const [archivosRequisitos, setArchivosRequisitos] = useState({});

  useEffect(() => {
    getRequisitosPorSeguro(seguro.id_seguro)
      .then(res => setRequisitos(res.data))
      .catch(err => console.error('Error al obtener requisitos:', err));
  }, [seguro]);

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

  const handleArchivoRequisito = (idRequisito, file) => {
    setArchivosRequisitos(prev => ({
      ...prev,
      [idRequisito]: file
    }));
  };

  const handleAddBeneficiario = () => {
    if (beneficiarios.length >= seguro.num_beneficiarios) return;
    setBeneficiarios([...beneficiarios, { nombre: '', cedula: '', parentesco: '', nacimiento: null }]);
  };

  const handleRemoveBeneficiario = (index) => {
    const nuevos = [...beneficiarios];
    nuevos.splice(index, 1);
    setBeneficiarios(nuevos);
  };

  const handleBeneficiarioChange = (index, field, value) => {
    const nuevos = [...beneficiarios];
    nuevos[index][field] = value;
    setBeneficiarios(nuevos);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id_seguro: seguro.id_seguro,
      id_usuario: JSON.parse(localStorage.getItem('usuario')).id_usuario, // desde el contexto o localStorage
      modalidadPago: formData.modalidadPago,
      firma: formData.firma,
      fecha: formData.fecha.toISOString().split('T')[0],
      hora: formData.hora.toISOString().split('T')[1].split('.')[0],
      estado: 0 // pendiente
    };

    try {
      await crearContrato(payload); // esto sí será JSON
      setSnackbar({ open: true, message: 'Contrato creado con éxito', severity: 'success' });
      setTimeout(onVolver, 1500);
    } catch (err) {
      console.error('Error al crear contrato:', err);
      setSnackbar({ open: true, message: 'Error al crear contrato', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Contratación de Seguro</Typography>
      <Typography variant="h6" color="primary" gutterBottom>{seguro.nombre}</Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit}>
        {/* Fecha y hora */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Fecha"
              value={formData.fecha}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Hora"
              value={formData.hora}
              onChange={handleTimeChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
        </Grid>

        {/* Beneficiario general */}
        <TextField
          fullWidth
          name="beneficiario"
          label="Nombre del beneficiario"
          value={formData.beneficiario}
          onChange={handleChange}
          sx={{ mb: 3 }}
        />

        {/* Modalidad de pago */}
        <TextField
          select
          fullWidth
          name="modalidadPago"
          label="Modalidad de pago"
          value={formData.modalidadPago}
          onChange={handleChange}
          sx={{ mb: 3 }}
        >
          <MenuItem value="mensual">Mensual</MenuItem>
          <MenuItem value="trimestral">Trimestral</MenuItem>
          <MenuItem value="anual">Anual</MenuItem>
        </TextField>

        {/* Documentos generales */}
        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          Subir documentos generales (PDF, imágenes)
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
          <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" mr={2}>
              {formData.documentos.map((f) => f.name).join(', ')}
            </Typography>
            <IconButton onClick={() => clearField('documentos')}>
              <ClearIcon />
            </IconButton>
          </Box>
        )}

        {/* Requisitos */}
        {requisitos.length > 0 && (
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>Requisitos para este seguro</Typography>
            {requisitos.map(req => (
              <Box key={req.id_requisito} mb={2}>
                <Typography variant="body2" sx={{ mb: 1 }}>📎 {req.nombre}</Typography>
                <Button variant="outlined" component="label">
                  Cargar archivo
                  <input
                    type="file"
                    hidden
                    accept=".pdf,image/*"
                    onChange={(e) => handleArchivoRequisito(req.id_requisito, e.target.files[0])}
                  />
                </Button>
                {archivosRequisitos[req.id_requisito] && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Archivo: {archivosRequisitos[req.id_requisito].name}
                  </Typography>
                )}
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* Beneficiarios adicionales */}
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Beneficiarios adicionales (máx. {seguro.num_beneficiarios})
          </Typography>
          {beneficiarios.map((b, i) => (
            <Grid container spacing={1} mb={2} key={i}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={b.nombre}
                  onChange={(e) => handleBeneficiarioChange(i, 'nombre', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Cédula"
                  value={b.cedula}
                  onChange={(e) => handleBeneficiarioChange(i, 'cedula', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Parentesco"
                  value={b.parentesco}
                  onChange={(e) => handleBeneficiarioChange(i, 'parentesco', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <DatePicker
                  label="Nacimiento"
                  value={b.nacimiento}
                  onChange={(v) => handleBeneficiarioChange(i, 'nacimiento', v)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <Button color="error" onClick={() => handleRemoveBeneficiario(i)}>Eliminar</Button>
              </Grid>
            </Grid>
          ))}
          {beneficiarios.length < seguro.num_beneficiarios && (
            <Button onClick={handleAddBeneficiario} variant="outlined">
              + Añadir beneficiario
            </Button>
          )}
        </Box>

        {/* Firma */}
        <TextField
          fullWidth
          name="firma"
          label="Firma electrónica (nombre completo)"
          value={formData.firma}
          onChange={handleChange}
          required
          sx={{ mt: 4, mb: 4 }}
        />

        {/* Botones */}
        <Box display="flex" justifyContent="space-between">
          <Button variant="text" onClick={onVolver}>← Volver</Button>
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