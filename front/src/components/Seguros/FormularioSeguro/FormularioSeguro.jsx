// src/pages/Seguros/FormularioSeguro/FormularioSeguro.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import PropTypes from "prop-types";

import {
  crearSeguro,
  editarSeguro,
  asociarBeneficios,
  asociarRequisitos,
} from "../../../services/SeguroService";
import {
  getBeneficios,
  getRequisitos,
  crearBeneficio,
  crearRequisito,
} from "../../../services/DatoSeguroService";

export const FormularioSeguro = ({ open, onClose, seguro, onSuccess }) => {
  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm();

  const [beneficiosDisponibles, setBeneficiosDisponibles] = useState([]);
  const [requisitosDisponibles, setRequisitosDisponibles] = useState([]);
  const [nuevoBeneficio, setNuevoBeneficio] = useState("");
  const [nuevoRequisito, setNuevoRequisito] = useState("");

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  // Cargo listas de beneficios y requisitos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resB, resR] = await Promise.all([
          getBeneficios(),
          getRequisitos(),
        ]);
        setBeneficiosDisponibles(resB.data);
        setRequisitosDisponibles(resR.data);
      } catch (err) {
        console.error("Error al cargar datos de beneficios/requisitos:", err);
      }
    };
    cargarDatos();
  }, []);

  // Cuando cambia "seguro", precargo el formulario o limpio para "crear"
  useEffect(() => {
    if (seguro) {
      // Convierte array de objetos a array de IDs
      const benIds = seguro.beneficios?.map((b) => b.id_beneficio) || [];
      const reqIds = seguro.requisitos?.map((r) => r.id_requisito) || [];

      reset({
        nombre: seguro.nombre || "",
        tipo: seguro.tipo || "",
        precio: seguro.precio || "",
        tiempo_pago: seguro.tiempo_pago || "",
        descripcion: seguro.descripcion || "",
        num_beneficiarios: seguro.num_beneficiarios || 1,
        cobertura: seguro.cobertura || "",
        beneficios: benIds,
        requisitos: reqIds,
      });
    } else {
      // Reset general para crear
      reset({
        nombre: "",
        tipo: "",
        precio: "",
        tiempo_pago: "",
        descripcion: "",
        num_beneficiarios: "",
        cobertura: "",
        beneficios: [],
        requisitos: [],
      });
    }
  }, [seguro, reset]);

  const onSubmit = async (data) => {
    // Validaciones manuales adicionales
    const precioNum = Number(data.precio);
    const coberturaNum = Number(data.cobertura);
    const beneficiariosNum = Number(data.num_beneficiarios);

    if (!data.tiempo_pago) {
      setError("tiempo_pago", {
        type: "manual",
        message: "Selecciona un tipo de pago",
      });
      return;
    }

    if (!data.beneficios || data.beneficios.length === 0) {
      setError("beneficios", {
        type: "manual",
        message: "Selecciona al menos un beneficio",
      });
      return;
    }

    if (!data.requisitos || data.requisitos.length === 0) {
      setError("requisitos", {
        type: "manual",
        message: "Selecciona al menos un requisito",
      });
      return;
    }

    if (isNaN(precioNum) || precioNum <= 0) {
      setError("precio", {
        type: "manual",
        message: "Precio inválido",
      });
      return;
    }

    if (isNaN(coberturaNum) || coberturaNum <= 0) {
      setError("cobertura", {
        type: "manual",
        message: "Cobertura inválida",
      });
      return;
    }

    if (isNaN(beneficiariosNum) || beneficiariosNum < 1) {
      setError("num_beneficiarios", {
        type: "manual",
        message: "Debe ser al menos 1 beneficiario",
      });
      return;
    }

    try {
      // Construyo el payload para crear o editar
      const datosEnviar = {
        nombre: data.nombre.trim(),
        tipo: data.tipo,
        precio: precioNum,
        tiempo_pago: data.tiempo_pago,
        descripcion: data.descripcion?.trim() || "",
        num_beneficiarios: beneficiariosNum,
        cobertura: coberturaNum,
      };

      let respuesta;
      if (seguro && seguro.id_seguro) {
        // Edición
        await editarSeguro(seguro.id_seguro, datosEnviar);
        respuesta = { data: { id: seguro.id_seguro } };
      } else {
        // Creación
        respuesta = await crearSeguro(datosEnviar);
      }

      const nuevoId = respuesta.data.id;
      // Asocio beneficios y requisitos (arrays de IDs)
      await Promise.all([
        asociarBeneficios(nuevoId, data.beneficios),
        asociarRequisitos(nuevoId, data.requisitos),
      ]);

      onSuccess(); // Recarga la lista en el padre
      onClose(); // Cierra el modal
    } catch (err) {
      console.error("Error al guardar el seguro:", err.response?.data || err);
    }
  };

  // Agrega un nuevo beneficio y recarga la lista
  const handleAgregarBeneficio = async () => {
    if (!nuevoBeneficio.trim()) return;
    try {
      await crearBeneficio({ nombre: nuevoBeneficio.trim(), detalle: "-" });
      const res = await getBeneficios();
      setBeneficiosDisponibles(res.data);
      setNuevoBeneficio("");
    } catch (err) {
      console.error("Error al crear beneficio:", err);
    }
  };

  // Agrega un nuevo requisito y recarga la lista
  const handleAgregarRequisito = async () => {
    if (!nuevoRequisito.trim()) return;
    try {
      await crearRequisito({ nombre: nuevoRequisito.trim(), detalle: "-" });
      const res = await getRequisitos();
      setRequisitosDisponibles(res.data);
      setNuevoRequisito("");
    } catch (err) {
      console.error("Error al crear requisito:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{seguro ? "Editar Seguro" : "Nuevo Seguro"}</DialogTitle>
      <DialogContent>
        <Box component="form" id="form-seguro" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2} mt={1}>
            {/* Nombre */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                {...register("nombre", {
                  required: "Nombre requerido",
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                    message: "Sólo letras y espacios",
                  },
                })}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            </Grid>

            {/* Tipo de Seguro */}
            <Grid item xs={12} sm={6}>
              <FormLabel>Tipo de Seguro</FormLabel>
              <Controller
                name="tipo"
                control={control}
                rules={{ required: "Selecciona el tipo de seguro" }}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="Vida"
                      control={<Radio />}
                      label="Vida"
                    />
                    <FormControlLabel
                      value="Salud"
                      control={<Radio />}
                      label="Salud"
                    />
                  </RadioGroup>
                )}
              />
              {errors.tipo && (
                <p style={{ color: "red", fontSize: isXs ? "0.75rem" : "0.9rem" }}>
                  {errors.tipo.message}
                </p>
              )}
            </Grid>

            {/* Precio */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Precio"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="Ej: 25.99"
                fullWidth
                {...register("precio", {
                  required: "Precio requerido",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Debe ser mayor a 0" },
                })}
                error={!!errors.precio}
                helperText={errors.precio?.message}
              />
            </Grid>

            {/* Tiempo de Pago */}
            <Grid item xs={12} sm={6}>
              <FormLabel>Tipo de Pago</FormLabel>
              <Controller
                name="tiempo_pago"
                control={control}
                rules={{ required: "Selecciona un tipo de pago" }}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="Mensual"
                      control={<Radio />}
                      label="Mensual"
                    />
                    <FormControlLabel
                      value="Trimestral"
                      control={<Radio />}
                      label="Trimestral"
                    />
                    <FormControlLabel
                      value="Anual"
                      control={<Radio />}
                      label="Anual"
                    />
                  </RadioGroup>
                )}
              />
              {errors.tiempo_pago && (
                <p style={{ color: "red", fontSize: isXs ? "0.75rem" : "0.9rem" }}>
                  {errors.tiempo_pago.message}
                </p>
              )}
            </Grid>

            {/* Descripción */}
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                {...register("descripcion")}
              />
            </Grid>

            {/* Número de Beneficiarios */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número máximo de beneficiarios"
                type="number"
                fullWidth
                {...register("num_beneficiarios", {
                  required: "Campo obligatorio",
                  valueAsNumber: true,
                  min: { value: 1, message: "Debe ser al menos 1" },
                })}
                error={!!errors.num_beneficiarios}
                helperText={errors.num_beneficiarios?.message}
              />
            </Grid>

            {/* Cobertura */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cobertura"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                placeholder="Ej: 10000.00"
                fullWidth
                {...register("cobertura", {
                  required: "Campo obligatorio",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Debe ser mayor a 0" },
                })}
                error={!!errors.cobertura}
                helperText={errors.cobertura?.message}
              />
            </Grid>

            {/* Checkbox de Beneficios */}
            <Grid item xs={12}>
              <FormLabel>Beneficios</FormLabel>
              <Controller
                name="beneficios"
                control={control}
                rules={{ required: "Selecciona al menos un beneficio" }}
                render={({ field }) => (
                  <FormGroup>
                    {beneficiosDisponibles.map((b) => {
                      const idNum = b.id_beneficio;
                      return (
                        <FormControlLabel
                          key={idNum}
                          control={
                            <Checkbox
                              value={idNum}
                              checked={field.value?.includes(idNum) || false}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), val]);
                                } else {
                                  field.onChange(
                                    (field.value || []).filter((x) => x !== val)
                                  );
                                }
                              }}
                            />
                          }
                          label={b.nombre}
                        />
                      );
                    })}
                  </FormGroup>
                )}
              />
              {errors.beneficios && (
                <p style={{ color: "red", fontSize: isXs ? "0.75rem" : "0.9rem" }}>
                  {errors.beneficios.message}
                </p>
              )}
              <Box mt={1}>
                <TextField
                  label="Nuevo beneficio"
                  fullWidth
                  value={nuevoBeneficio}
                  onChange={(e) => setNuevoBeneficio(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={handleAgregarBeneficio}
                  sx={{ mt: 1 }}
                >
                  Agregar beneficio
                </Button>
              </Box>
            </Grid>

            {/* Checkbox de Requisitos */}
            <Grid item xs={12}>
              <FormLabel>Documentos necesarios (Requisitos)</FormLabel>
              <Controller
                name="requisitos"
                control={control}
                rules={{ required: "Selecciona al menos un requisito" }}
                render={({ field }) => (
                  <FormGroup>
                    {requisitosDisponibles.map((r) => {
                      const idNum = r.id_requisito;
                      return (
                        <FormControlLabel
                          key={idNum}
                          control={
                            <Checkbox
                              value={idNum}
                              checked={field.value?.includes(idNum) || false}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), val]);
                                } else {
                                  field.onChange(
                                    (field.value || []).filter((x) => x !== val)
                                  );
                                }
                              }}
                            />
                          }
                          label={r.nombre}
                        />
                      );
                    })}
                  </FormGroup>
                )}
              />
              {errors.requisitos && (
                <p style={{ color: "red", fontSize: isXs ? "0.75rem" : "0.9rem" }}>
                  {errors.requisitos.message}
                </p>
              )}
              <Box mt={1}>
                <TextField
                  label="Nuevo requisito"
                  fullWidth
                  value={nuevoRequisito}
                  onChange={(e) => setNuevoRequisito(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={handleAgregarRequisito}
                  sx={{ mt: 1 }}
                >
                  Agregar requisito
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      {/* Botones de acción */}
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button type="submit" form="form-seguro" variant="contained">
          {seguro ? "Guardar Cambios" : "Crear Seguro"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FormularioSeguro.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  seguro: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
};
