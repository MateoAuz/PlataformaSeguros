// src/components/PagosCliente.jsx
"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  TextField,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import axios from "axios";
import { UserContext } from "../../context/UserContext";

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
      // 1) Cargar contratos para el dropdown
      axios
        .get(`http://localhost:3030/contratos/mis-seguros/${usuario.id_usuario}`)
        .then((res) => {
          setSeguros(res.data);
        })
        .catch((err) => console.error("Error cargando seguros:", err));

      // 2) Cargar historial de pagos
      axios
        .get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`)
        .then((res) => {
          setPagos(res.data);
        })
        .catch((err) => console.error("Error cargando pagos:", err));
    }
  }, [usuario]);

  // Filtrar contratos cuyo estado_pago ≠ 1
  const segurosParaPagar = seguros.filter((s) => s.estado_pago !== 1);

  const obtenerPrecioSeguroSeleccionado = () => {
    const sel = seguros.find((s) => s.id_usuario_seguro === contratoSeleccionado);
    return sel?.precio ?? 0;
  };

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
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
    // Asegúrate de enviar un identificador válido para la carpeta en S3:
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

        // Recargar historial de pagos
        axios
          .get(`http://localhost:3030/pagos/cliente/${usuario.id_usuario}`)
          .then((r) => setPagos(r.data))
          .catch((err) => console.error("Error recargando pagos:", err));

        // Recargar contratos para actualizar estado_pago
        axios
          .get(`http://localhost:3030/contratos/mis-seguros/${usuario.id_usuario}`)
          .then((r) => setSeguros(r.data))
          .catch((err) => console.error("Error recargando contratos:", err));
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

  /**
   * Extrae la “key” interna de S3 a partir de la URL completa.
   * Usamos el constructor URL para que funcione con cualquier dominio o región.
   * Luego, si la carpeta real en S3 empieza con "undefined/", nos aseguramos de incluirlo.
   *
   * Ejemplo:
   *   urlCompleta = "https://mi-bucket.s3.amazonaws.com/undefined/BorisRex/archivo.pdf"
   *   urlObj.pathname = "/undefined/BorisRex/archivo.pdf"
   *   keyInicial = "undefined/BorisRex/archivo.pdf"
   *
   *   En caso de que el URL no contenga "undefined", forzamos añadírselo:
   *   urlCompleta = "https://mi-bucket.s3.amazonaws.com/BorisRex/archivo.pdf"
   *   urlObj.pathname = "/BorisRex/archivo.pdf"
   *   keyInicial = "BorisRex/archivo.pdf"
   *   keyFinal = "undefined/BorisRex/archivo.pdf"
   */
  const extraerKeyDeUrl = (urlCompleta) => {
    try {
      const urlObj = new URL(urlCompleta);
      let key = urlObj.pathname; // ej. "/undefined/BorisRex/archivo.pdf" o "/BorisRex/archivo.pdf"
      if (key.startsWith("/")) {
        key = key.slice(1); // "undefined/BorisRex/archivo.pdf" o "BorisRex/archivo.pdf"
      }
      // Si no empieza por "undefined/", se lo anteponemos
      if (!key.startsWith("undefined/")) {
        key = `undefined/${key}`;
      }
      return key;
    } catch (error) {
      console.error("extraerKeyDeUrl: URL inválida ->", urlCompleta, error);
      return "";
    }
  };

  /**
   * Solicita a nuestro backend un pre-signed URL para descarga.
   * Llama a GET /login/descarga/:keyEncoded. Luego abre la URL firmada en una nueva pestaña.
   */
  const descargarArchivo = async (urlComprobante) => {
    const key = extraerKeyDeUrl(urlComprobante);
    if (!key) {
      alert("No se pudo determinar la ruta del comprobante.");
      return;
    }
    const keyEncoded = encodeURIComponent(key);

    try {
      const res = await fetch(`http://localhost:3030/login/descarga/${keyEncoded}`);
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("No se obtuvo URL de descarga válido.");
      }
    } catch (err) {
      console.error("Error al descargar archivo:", err);
      alert("Hubo un problema al intentar descargar el comprobante.");
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Pagos de Seguros
      </Typography>

      {/* ───────────── Selector de contrato a pagar ───────────── */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Seguro contratado</InputLabel>
        <Select
          value={contratoSeleccionado}
          label="Seguro contratado"
          onChange={(e) => setContratoSeleccionado(e.target.value)}
        >
          {segurosParaPagar.length === 0 ? (
            <MenuItem value="" disabled>
              No quedan seguros por pagar
            </MenuItem>
          ) : (
            segurosParaPagar.map((s) => (
              <MenuItem key={s.id_usuario_seguro} value={s.id_usuario_seguro}>
                {s.nombre} - {s.modalidad_pago} (${s.precio})
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {/* ───────────── Formulario de registro de pago ───────────── */}
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
              <input
                type="file"
                accept="application/pdf"
                onChange={handleArchivoChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                onClick={handlePagoSubmit}
                variant="contained"
                color="primary"
                disabled={!contratoSeleccionado || !cantidad || !archivo}
              >
                Enviar pago
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* ───────────── Historial de pagos ───────────── */}
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
                <TableCell>
                  {pago.fecha_pago
                    ? new Date(pago.fecha_pago).toLocaleDateString()
                    : "Sin fecha"}
                </TableCell>
                <TableCell>
                  {typeof pago.cantidad === "number"
                    ? `$${pago.cantidad.toFixed(2)}`
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {pago.comprobante_pago ? (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => descargarArchivo(pago.comprobante_pago)}
                    >
                      Ver comprobante
                    </Button>
                  ) : (
                    "Sin archivo"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ───────────── Snackbar de notificaciones ───────────── */}
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
