"use client";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import emailjs from 'emailjs-com';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { crearContrato } from '../../services/ContratoService';
import { getRequisitosPorSeguro } from '../../services/RequisitoService';
import { BaseUrl } from '../../shared/conexion';

// ✅ UTILITARIO UNIVERSAL PARA OBTENER EL ID DE USUARIO
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

const FormularioContratacion = ({ seguro, onVolver }) => {
  const [correo, setCorreo] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState('');
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [requisitos, setRequisitos] = useState([]);
  const [archivosRequisitos, setArchivosRequisitos] = useState({});
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [terminosVistos, setTerminosVistos] = useState(false);


  

  useEffect(() => {
    if (seguro?.id_seguro) {
      getRequisitosPorSeguro(seguro.id_seguro)
        .then(res => setRequisitos(res.data))
        .catch(err => console.error('Error al obtener requisitos:', err));
    }
  }, [seguro]);

  const enviarCodigoVerificacion = async () => {
    if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
      setSnackbar({ open: true, message: "Correo inválido.", severity: "error" });
      return;
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGenerado(codigo);

    // 🔵 Intentar primero con EmailJS
    try {
      await emailjs.send(
        'service_c4us1gc',
        'template_eiu5j2s',
        {
          to_email: correo,
          subject: "Código de Verificación",
          message: `Tu código de verificación es: ${codigo}`
        },
        '3sOnnDkXYopdiWy7l'
      );
      setCodigoEnviado(true);
      setSnackbar({ open: true, message: "Código enviado al correo (EmailJS).", severity: "info" });
    } catch (errorEmailJS) {
      console.warn("❌ Error con EmailJS, intentando con nodemailer...", errorEmailJS);

      // 🟡 Intentar con tu backend y nodemailer como respaldo
      try {
        const res = await fetch(`${BaseUrl.BASE_URL}enviar-codigo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correoDestino: correo, codigo })
        });

        if (!res.ok) throw new Error("Fallo al usar nodemailer");

        setCodigoEnviado(true);
        setSnackbar({ open: true, message: "Código enviado al correo (Servidor Local).", severity: "info" });
      } catch (errorNode) {
        console.error("❌ Error total al enviar código:", errorNode);
        setSnackbar({ open: true, message: "Error total al enviar el código.", severity: "error" });
      }
    }
  };



  const handleArchivoRequisito = (idRequisito, file) => {
    setArchivosRequisitos(prev => ({ ...prev, [idRequisito]: file }));
  };

  // Beneficiarios
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

  // Validación y envío
  const handleSubmit = async (e) => {
    e.preventDefault();

    const id_usuario = getIdUsuarioLocalStorage();

    if (!id_usuario) {
      setSnackbar({ open: true, message: "Error: No se encontró un usuario válido. Vuelve a iniciar sesión.", severity: "error" });
      return;
    }
    if (requisitos.some(r => !archivosRequisitos[r.id_requisito])) {
      setSnackbar({ open: true, message: "Debes adjuntar TODOS los documentos requeridos (PDF).", severity: "error" });
      return;
    }
    if (!codigoEnviado || codigoIngresado !== codigoGenerado) {
      setSnackbar({ open: true, message: "Código de verificación incorrecto o no enviado.", severity: "error" });
      return;
    }
    for (const b of beneficiarios) {
  if (!b.nombre || !b.parentesco || !b.cedula || !b.nacimiento) {
    setSnackbar({ open: true, message: "Todos los campos del beneficiario deben estar completos.", severity: "error" });
    return;
  }

  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(b.nombre)) {
    setSnackbar({ open: true, message: "El nombre del beneficiario solo debe contener letras.", severity: "error" });
    return;
  }

  if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(b.parentesco)) {
    setSnackbar({ open: true, message: "El parentesco del beneficiario solo debe contener letras.", severity: "error" });
    return;
  }

  if (!/^\d{10}$/.test(b.cedula)) {
    setSnackbar({ open: true, message: "La cédula debe contener exactamente 10 números.", severity: "error" });
    return;
  }

  const nacimientoDate = new Date(b.nacimiento);
  const edad = new Date().getFullYear() - nacimientoDate.getFullYear();
  const mes = new Date().getMonth() - nacimientoDate.getMonth();
  const dia = new Date().getDate() - nacimientoDate.getDate();
  if (edad < 18 || (edad === 18 && mes < 0) || (edad === 18 && mes === 0 && dia < 0)) {
    setSnackbar({ open: true, message: "El beneficiario debe ser mayor de edad.", severity: "error" });
    return;
  }
}

    setLoading(true);
    const formDataEnvio = new FormData();
    const now = new Date();
    const horaActual = now.toTimeString().split(' ')[0];

    formDataEnvio.append("id_usuario", id_usuario);
    formDataEnvio.append("id_seguro", seguro.id_seguro);
    formDataEnvio.append("modalidad_pago", seguro.tiempo_pago);
    formDataEnvio.append("hora", horaActual);

    // Adjuntar requisitos
    Object.entries(archivosRequisitos).forEach(([idRequisito, archivo]) => {
      formDataEnvio.append(`documentos[${idRequisito}]`, archivo);
    });

    // Beneficiarios (opcional)
    beneficiarios.forEach((b, i) => {
      formDataEnvio.append(`beneficiarios[${i}]`, JSON.stringify(b));
    });

    try {
      await crearContrato(formDataEnvio);
      setSnackbar({ open: true, message: 'Contrato enviado con éxito', severity: 'success' });

      // Limpia o regresa a la vista de selección:
      setTimeout(() => {
        // Limpia beneficiarios y archivos, o navega atrás según tu lógica:
        onVolver(); // Si quieres regresar a la selección
      }, 1500);

    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error al enviar contrato', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Contratación de Seguro</Typography>
      <Typography variant="h5" color="primary" gutterBottom>{seguro.nombre}</Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit}>

        <Box mb={2} textAlign="center">
          <Typography variant="subtitle1">Tipo de pago:</Typography>
          <Chip
            label={seguro.tiempo_pago}
            color="primary"
            variant="outlined"
            sx={{ mt: 1, fontSize: '1rem', px: 2.5, py: 1, height: 'auto' }}
          />
        </Box>

        {/* DOCUMENTOS REQUERIDOS */}
        {requisitos.length > 0 && (
          <Box mt={4}>
            <Typography variant="subtitle1" gutterBottom>Documentos requeridos para esta contratación:</Typography>
            {requisitos.map(requisito => (
              <Box key={requisito.id_requisito} mb={2}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  📎 {requisito.nombre} <span style={{ color: "red" }}>*</span>
                </Typography>
                <Button
                  variant={archivosRequisitos[requisito.id_requisito] ? "contained" : "outlined"}
                  color={archivosRequisitos[requisito.id_requisito] ? "success" : "primary"}
                  component="label"
                  fullWidth
                  sx={{ fontWeight: 'bold', mb: 1 }}
                >
                  {archivosRequisitos[requisito.id_requisito] ? "PDF cargado" : "Adjuntar PDF"}
                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => handleArchivoRequisito(requisito.id_requisito, e.target.files[0])}
                    required
                  />
                </Button>
                {archivosRequisitos[requisito.id_requisito] &&
                  <Typography variant="body2" color="text.secondary">
                    Archivo: {archivosRequisitos[requisito.id_requisito].name}
                  </Typography>
                }
              </Box>
            ))}
            <Divider sx={{ my: 3 }} />
          </Box>
        )}

        {/* BENEFICIARIOS */}
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Registra a tus beneficiarios (opcional):
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Puedes añadir hasta {seguro.num_beneficiarios} beneficiario(s) para este seguro.
          </Typography>
          {beneficiarios.map((b, i) => (
            <Grid container spacing={1} mb={2} key={i}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Nombre completo" value={b.nombre} onChange={(e) => handleBeneficiarioChange(i, 'nombre', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Cédula" value={b.cedula} onChange={(e) => handleBeneficiarioChange(i, 'cedula', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="Parentesco" value={b.parentesco} onChange={(e) => handleBeneficiarioChange(i, 'parentesco', e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <DatePicker
                  label="Fecha de nacimiento"
                  value={b.nacimiento}
                  onChange={(v) => handleBeneficiarioChange(i, 'nacimiento', v)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <Button color="error" onClick={() => handleRemoveBeneficiario(i)}>Eliminar beneficiario</Button>
              </Grid>
            </Grid>
          ))}
          {beneficiarios.length < seguro.num_beneficiarios && (
            <Button fullWidth onClick={handleAddBeneficiario} variant="outlined" sx={{ fontWeight: 'bold', color: 'primary', borderColor: 'primary' }}>
              + AÑADIR BENEFICIARIO
            </Button>
          )}
        </Box>
        {/* FIRMA ELECTRÓNICA */}
        <Box mt={3} mb={3}>
          <Typography variant="subtitle1" gutterBottom>Correo electrónico de verificación</Typography>
          <TextField
            label="Correo electrónico"
            fullWidth
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            sx={{ mb: 1 }}
          />
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={enviarCodigoVerificacion}
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Enviar código de verificación
          </Button>

          {codigoEnviado && (
            <TextField
              label="Ingresa el código recibido"
              fullWidth
              value={codigoIngresado}
              onChange={(e) => setCodigoIngresado(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          )}
        </Box>
          <Box mt={2}>
            <label>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => {
                  if (!terminosVistos) {
                    setSnackbar({ open: true, message: "Por favor lee los términos y condiciones antes de aceptar.", severity: "warning" });
                    return;
                  }
                  setAceptaTerminos(e.target.checked);
                }}
                style={{ marginRight: '10px' }}
              />
              Acepto los <button
              onClick={(e) => {
                e.preventDefault();
                setMostrarModal(true);
              }}
            >
              términos y condiciones
            </button>
            </label>

            

          </Box>

        <Box display="flex" justifyContent="space-between" mt={4} gap={2}>
          <Button fullWidth variant="outlined" color="primary" onClick={onVolver} sx={{ fontWeight: 'bold' }}>← VOLVER</Button>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading || !aceptaTerminos}
            startIcon={loading && <CircularProgress size={20} />}
            sx={{ fontWeight: 'bold' }}
          >
            {loading ? 'Enviando...' : 'VERIFICAR Y CONTRATAR'}
          </Button>

          <Dialog
            open={mostrarModal}
            onClose={() => setMostrarModal(false)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Términos y Condiciones</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                Al proceder con la contratación de un seguro a través de esta plataforma, el usuario declara que la información proporcionada es verídica y corresponde a su identidad personal.
              </Typography>
              <Typography variant="body2" paragraph>
                La contratación debe ser realizada exclusivamente por el titular del documento de identificación ingresado. Cualquier intento de suplantación de identidad o falsificación de datos será considerado una falta grave y podría ser notificado a las autoridades pertinentes.
              </Typography>
              <Typography variant="body2" paragraph>
                El usuario acepta que todos los documentos adjuntados tienen validez legal y han sido emitidos por las entidades correspondientes. Asimismo, se compromete a mantener actualizados sus datos y a no realizar contrataciones a nombre de terceros sin autorización expresa y comprobable.
              </Typography>
              <Typography variant="body2" paragraph>
                Al aceptar estos términos, usted confirma que ha leído y comprendido las condiciones de contratación, y que asume total responsabilidad por el uso de esta plataforma.
              </Typography>
              <Typography variant="body2" paragraph>
                Si tiene dudas sobre su identidad o desea delegar este trámite, por favor contáctese con un agente autorizado antes de continuar.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setMostrarModal(false); setTerminosVistos(true); }}>Cerrar</Button>
            </DialogActions>
          </Dialog>

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
