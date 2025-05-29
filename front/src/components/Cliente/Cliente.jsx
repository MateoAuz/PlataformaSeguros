"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  Grid,
  CircularProgress
} from "@mui/material";
import { UserContext } from "../../context/UserContext";
import { getContratos } from "../../services/ContratoService";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export const Cliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fechaActual = new Date();
  const fechaStr = fechaActual.toLocaleString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    if (!usuario || !usuario.id_usuario) {
      setLoading(false);
      return;
    }

    getContratos(usuario.id_usuario)
      .then((res) => {
        const activos = res.data.filter(c => c.estado === 1); // Mostrar solo aceptados
        setSeguros(activos);
      })
      .catch((err) => console.error("Error al cargar seguros:", err))
      .finally(() => setLoading(false));
  }, [usuario]);

  const calcularDiasRestantes = (ultimaFechaPago) => {
    const fechaPago = new Date(ultimaFechaPago);
    const proximo = new Date(fechaPago);
    proximo.setMonth(proximo.getMonth() + 1);

    const diffTime = proximo - fechaActual;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#FFF3E0", minHeight: "100vh" }}>
      {/* Bienvenida */}
      <Box textAlign="center" mb={4}>
        <Avatar sx={{ bgcolor: "#0D2B81", width: 80, height: 80, mx: "auto", mb: 2 }}>
          <CalendarMonthIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" fontWeight="bold" color="#0D2B81">
          Bienvenido(a), {usuario?.nombre} {usuario?.apellido}
        </Typography>
        <Typography variant="body1" mt={1} fontStyle="italic">
          "Asegurar tu futuro es cuidar lo que más amas"
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" mt={1}>
          {fechaStr}
        </Typography>
      </Box>

      {/* Resumen de seguros */}
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h5" mb={2} color="#0D2B81">
        Tus seguros activos
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : seguros.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Aún no tienes seguros contratados o tus contratos están pendientes de aprobación.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {seguros.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id_usuario_seguro_per}>
              <Card sx={{ backgroundColor: "#f5f5f5" }}>
                <CardContent>
                  <Typography variant="h6" color="#0D2B81">{s.nombre}</Typography>
                  <Typography variant="body2">💲 Costo mensual: ${s.precio}</Typography>
                  <Typography variant="body2">
                    ⏳ Siguiente pago en: <strong>{calcularDiasRestantes(s.fecha_pago)}</strong> días
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* GIF decorativo */}
      <Box mt={6} display="flex" justifyContent="center">
        <img
          src="/Img/GifCliente.gif"
          alt="Bienvenida visual"
          style={{ width: '80%', maxWidth: '600px', borderRadius: '16px' }}
        />
      </Box>
    </Box>
  );
};

export default Cliente;
