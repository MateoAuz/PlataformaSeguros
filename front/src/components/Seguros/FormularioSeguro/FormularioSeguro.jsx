import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, FormLabel, FormGroup,
  FormControlLabel, Checkbox, RadioGroup, Radio, Box
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import PropTypes from 'prop-types';
import {
  crearSeguro, editarSeguro,
  asociarCoberturas, asociarBeneficios, asociarRequisitos
} from '../../../services/SeguroService';
import {
  getCoberturas, getBeneficios, getRequisitos,
  crearBeneficio, crearRequisito
} from '../../../services/DatoSeguroService';

export const FormularioSeguro = ({ open, onClose, seguro, onSuccess }) => {
  const {
    register, handleSubmit, control, setError, reset,
    formState: { errors }
  } = useForm();

  const [beneficios, setBeneficios] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [nuevoBeneficio, setNuevoBeneficio] = useState('');
  const [nuevoRequisito, setNuevoRequisito] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      const [resB, resR] = await Promise.all([
        getBeneficios(), getRequisitos()
      ]);
      setBeneficios(resB.data);
      setRequisitos(resR.data);
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (seguro) {
      reset({
        ...seguro,
        tiempo_pago: seguro.tiempo_pago || '',
        beneficios: seguro.beneficios || [],
        requisitos: seguro.requisitos || [],
      });
    } else {
      reset({
        nombre: '', precio: '', descripcion: '',
        tipo: '', cobertura: '', num_beneficiarios: '',
        tiempo_pago: '', beneficios: [], requisitos: []
      });
    }
  }, [seguro, reset]);

  const onSubmit = async (data) => {
    const precio = Number(data.precio);
    const cobertura = Number(data.cobertura);
    const beneficiarios = Number(data.num_beneficiarios);

    if (!data.tiempo_pago) {
      setError('tiempo_pago', {
        type: 'manual',
        message: 'Selecciona al menos un tipo de pago'
      });
      return;
    }

    if (!data.beneficios || data.beneficios.length === 0) {
      setError('beneficios', {
        type: 'manual',
        message: 'Selecciona al menos un beneficio'
      });
      return;
    }

    if (!data.requisitos || data.requisitos.length === 0) {
      setError('requisitos', {
        type: 'manual',
        message: 'Selecciona al menos un requisito'
      });
      return;
    }

    if (isNaN(precio) || precio <= 0) {
      setError('precio', { type: 'manual', message: 'Precio inválido' });
      return;
    }

    if (isNaN(cobertura) || cobertura <= 0) {
      setError('cobertura', { type: 'manual', message: 'Cobertura inválida' });
      return;
    }

    if (isNaN(beneficiarios) || beneficiarios < 1) {
      setError('num_beneficiarios', {
        type: 'manual',
        message: 'Debe ser al menos 1 beneficiario'
      });
      return;
    }

    try {
      const datosEnviar = {
        ...data,
        precio,
        cobertura,
        num_beneficiarios: beneficiarios,
        descripcion: data.descripcion?.trim() || '',
        tiempo_pago: data.tiempo_pago
      };

      let res;
      if (seguro) {
        await editarSeguro(seguro.id_seguro, datosEnviar);
        res = { data: { id: seguro.id_seguro } };
      } else {
        res = await crearSeguro(datosEnviar);
      }

      await Promise.all([
        asociarCoberturas(res.data.id, data.coberturas || []),
        asociarBeneficios(res.data.id, data.beneficios),
        asociarRequisitos(res.data.id, data.requisitos)
      ]);

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error al guardar el seguro:', err.response?.data || err.message);
    }
  };

  const handleAgregarBeneficio = async () => {
    if (!nuevoBeneficio.trim()) return;
    await crearBeneficio({ nombre: nuevoBeneficio, detalle: '-' });
    const actualizado = await getBeneficios();
    setBeneficios(actualizado.data);
    setNuevoBeneficio('');
  };

  const handleAgregarRequisito = async () => {
    if (!nuevoRequisito.trim()) return;
    await crearRequisito({ nombre: nuevoRequisito, detalle: '-' });
    const actualizado = await getRequisitos();
    setRequisitos(actualizado.data);
    setNuevoRequisito('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{seguro ? 'Editar Seguro' : 'Nuevo Seguro'}</DialogTitle>
      <DialogContent>
        <form id="form-seguro" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} mt={1}>

            <Grid item xs={12}>
              <TextField
                label="Nombre"
                fullWidth
                {...register('nombre', {
                  required: 'Nombre requerido',
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                    message: 'Solo letras y espacios'
                  }
                })}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel>Tipo de Seguro:</FormLabel>
              <Controller
                name="tipo"
                control={control}
                rules={{ required: 'Selecciona el tipo de seguro' }}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="Vida" control={<Radio />} label="Vida" />
                    <FormControlLabel value="Salud" control={<Radio />} label="Salud" />
                  </RadioGroup>
                )}
              />
              {errors.tipo && <p style={{ color: 'red' }}>{errors.tipo.message}</p>}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Precio"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="Ej: 25.99"
                fullWidth
                {...register('precio', {
                  required: 'Precio requerido',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Debe ser mayor a 0' }
                })}
                error={!!errors.precio}
                helperText={errors.precio?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel>Tipo de pago:</FormLabel>
              <Controller
                name="tiempo_pago"
                control={control}
                rules={{ required: 'Selecciona un tipo de pago' }}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value="Mensual" control={<Radio />} label="Mensual" />
                    <FormControlLabel value="Trimestral" control={<Radio />} label="Trimestral" />
                    <FormControlLabel value="Anual" control={<Radio />} label="Anual" />
                  </RadioGroup>
                )}
              />
              {errors.tiempo_pago && <p style={{ color: 'red' }}>{errors.tiempo_pago.message}</p>}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth multiline rows={3}
                {...register('descripcion')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Número máximo de beneficiarios"
                type="number"
                fullWidth
                {...register('num_beneficiarios', {
                  required: 'Campo obligatorio',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Debe ser al menos 1' }
                })}
                error={!!errors.num_beneficiarios}
                helperText={errors.num_beneficiarios?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Cobertura"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="Ej: 10000.00"
                fullWidth
                {...register('cobertura', {
                  required: 'Campo obligatorio',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Debe ser mayor a 0' }
                })}
                error={!!errors.cobertura}
                helperText={errors.cobertura?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormLabel>Beneficios:</FormLabel>
              <FormGroup>
                {beneficios.map((b) => (
                  <FormControlLabel
                    key={b.id_beneficio}
                    control={<Checkbox value={b.id_beneficio} {...register('beneficios')} />}
                    label={b.nombre}
                  />
                ))}
              </FormGroup>
              {errors.beneficios && <p style={{ color: 'red' }}>{errors.beneficios.message}</p>}
              <Box mt={1}>
                <TextField
                  label="Nuevo beneficio"
                  fullWidth
                  value={nuevoBeneficio}
                  onChange={(e) => setNuevoBeneficio(e.target.value)}
                />
                <Button variant="outlined" onClick={handleAgregarBeneficio} sx={{ mt: 1 }}>
                  Agregar beneficio
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormLabel>Documentos necesarios (Requisitos):</FormLabel>
              <FormGroup>
                {requisitos.map((r) => (
                  <FormControlLabel
                    key={r.id_requisito}
                    control={<Checkbox value={r.id_requisito} {...register('requisitos')} />}
                    label={r.nombre}
                  />
                ))}
              </FormGroup>
              {errors.requisitos && <p style={{ color: 'red' }}>{errors.requisitos.message}</p>}
              <Box mt={1}>
                <TextField
                  label="Nuevo requisito"
                  fullWidth
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                />
                <Button variant="outlined" onClick={handleAgregarRequisito} sx={{ mt: 1 }}>
                  Agregar requisito
                </Button>
              </Box>
            </Grid>

          </Grid>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button type="submit" form="form-seguro" variant="contained">
          {seguro ? 'Guardar Cambios' : 'Crear Seguro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FormularioSeguro.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  seguro: PropTypes.object,
  onSuccess: PropTypes.func.isRequired
};
