"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Select, MenuItem, InputLabel, FormControl,
  Button, TextField, Paper, Grid, Snackbar, Alert,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
} from "@mui/material";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { BotonVerArchivo } from "../../components/BotonVerArchivo";
import { SubirArchivo } from "../../components/SubirArchivo";

const PagosCliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [alerta, setAlerta] = useState({ open: false, tipo: "success" });

  useEffect(() => {
    if (usuario?.id_usuario) {
      axios.get(`http://localhost:3030/contratos/mis-seguros/${usuario.id_usuario}`)
        .then((res) => setSeguros(res.data))
        .catch((err) => console.error("Error cargando seguros:", err));

      axios.get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`)
        .then((res) => setPagos(res.data))
        .catch((err) => console.error("Error cargando pagos:", err));
    }
  }, [usuario]);

  const obtenerPrecioSeguroSeleccionado = () => {
    const sel = seguros.find((s) => s.id_usuario_seguro === contratoSeleccionado);
    return sel?.precio ?? 0;
  };

  const handlePagoSubmit = async () => {
    const precioSeguro = obtenerPrecioSeguroSeleccionado();
    const montoPagado = parseFloat(cantidad);

    if (!archivo || !cantidad || !contratoSeleccionado) {
      setMensaje("Completa todos los campos y selecciona un archivo");
      setAlerta({ open: true, tipo: "error" });
      return;
    }

    if (montoPagado !== parseFloat(precioSeguro)) {
      setMensaje(`El monto debe ser exactamente $${precioSeguro}`);
      setAlerta({ open: true, tipo: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("cantidad", montoPagado);
    formData.append("id_usuario_seguro_per", contratoSeleccionado);
    formData.append("usuario", usuario.username || usuario.id_usuario);

    try {
      const res = await fetch("http://localhost:3030/pagos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMensaje("Pago registrado exitosamente");
        setAlerta({ open: true, tipo: "success" });
        setArchivo(null);
        setCantidad("");
        setContratoSeleccionado("");

        axios.get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`)
          .then((r) => setPagos(r.data));

        axios.get(`http://localhost:3030/contratos/mis-seguros/${usuario.id_usuario}`)
          .then((r) => setSeguros(r.data));
      } else {
        setMensaje(data.error || "Error al registrar pago");
        setAlerta({ open: true, tipo: "error" });
      }
    } catch (err) {
      console.error("Error al enviar pago:", err);
      setMensaje("No se pudo conectar al servidor");
      setAlerta({ open: true, tipo: "error" });
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Pagos de Seguros
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Seguro contratado</InputLabel>
        <Select
          value={contratoSeleccionado}
          label="Seguro contratado"
          onChange={(e) => setContratoSeleccionado(e.target.value)}
        >
          {seguros.length === 0 ? (
            <MenuItem value="" disabled>
              No tienes seguros contratados
            </MenuItem>
          ) : (
            seguros.map((s) => (
              <MenuItem key={s.id_usuario_seguro} value={s.id_usuario_seguro}>
                {s.nombre} - {s.modalidad_pago} (${s.precio})
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* ────── Formulario de pago ────── */}
      {(() => {
        const contrato = seguros.find((s) => s.id_usuario_seguro === contratoSeleccionado);
        if (!contrato) return null;

        if (contrato.estado_pago === 1) {
  return (
    <Paper sx={{ p: 2, mt: 3, backgroundColor: "#f8f9fa" }}>
      <Typography variant="body1" color="textSecondary">
        Ya realizaste el pago correspondiente a este período.
      </Typography>
      {contrato.proximo_vencimiento && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          El próximo pago podrá realizarse a partir del <strong>{new Date(contrato.proximo_vencimiento).toLocaleDateString()}</strong>.
        </Typography>
      )}
    </Paper>
  );
}

        return (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registrar nuevo pago
            </Typography>
            <form>
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
                  <SubirArchivo
                    nombre="Subir comprobante (PDF)"
                    tipo="application/pdf"
                    requerido={true} // <-- Esto activa el borde amarillo si no hay archivo
                    onArchivoSeleccionado={setArchivo}
                  />

                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={handlePagoSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!cantidad || !archivo}
                  >
                    Enviar pago
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        );
      })()}

      {/* ────── Historial de pagos ────── */}
      <Typography variant="h6" mt={5} mb={1}>
        Historial de pagos
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Seguro</strong></TableCell>
              <TableCell><strong>Fecha</strong></TableCell>
              <TableCell><strong>Monto</strong></TableCell>
              <TableCell><strong>Comprobante</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map((pago) => (
              <TableRow key={pago.id_pago_seguro}>
                <TableCell>{pago.nombre_seguro || "N/A"}</TableCell>
                <TableCell>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : "Sin fecha"}</TableCell>
                <TableCell>{typeof pago.cantidad === "number" ? `$${pago.cantidad.toFixed(2)}` : "N/A"}</TableCell>
                <TableCell>
                  {pago.comprobante_pago ? (
                    <BotonVerArchivo
                      rutaDescarga={`http://localhost:3030/pagos/descarga/${pago.id_pago_seguro}`}
                    />
                  ) : (
                    "Sin archivo"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ────── Snackbar ────── */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={5000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alerta.tipo} variant="filled">
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagosCliente;
