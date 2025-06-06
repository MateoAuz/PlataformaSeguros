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
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { UserContext } from "../../context/UserContext";
import { getContratos } from "../../services/ContratoService";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export const Cliente = () => {
  const { usuario } = useContext(UserContext);
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Para ajustar algunos estilos según breakpoints
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

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
        setSeguros(res.data);
      })
      .catch((err) => console.error("Error al cargar seguros:", err))
      .finally(() => setLoading(false));
  }, [usuario]);

  const calcularDiasRestantes = (proximoFechaPago) => {
    const proximo = new Date(proximoFechaPago);
    const hoySinHora = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      fechaActual.getDate()
    );
    const diffTime = proximo - hoySinHora;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#FFF3E0",
        minHeight: "100vh",
      }}
    >
      {/* Bienvenida */}
      <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
        <Avatar
          sx={{
            bgcolor: "#0D2B81",
            width: { xs: 60, md: 80 },
            height: { xs: 60, md: 80 },
            mx: "auto",
            mb: { xs: 1.5, md: 2 },
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: { xs: 28, md: 40 } }} />
        </Avatar>
        <Typography
          variant={isXs ? "h5" : "h4"}
          fontWeight="bold"
          color="#0D2B81"
        >
          Bienvenido(a), {usuario?.nombre} {usuario?.apellido}
        </Typography>
        <Typography
          variant={isXs ? "body2" : "body1"}
          mt={1}
          fontStyle="italic"
        >
          "Asegurar tu futuro es cuidar lo que más amas"
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          mt={1}
          fontSize={isXs ? "0.8rem" : undefined}
        >
          {fechaStr}
        </Typography>
      </Box>

      {/* Resumen de seguros */}
      <Divider sx={{ mb: { xs: 2, md: 2 } }} />
      <Typography
        variant={isXs ? "h6" : "h5"}
        mb={2}
        color="#0D2B81"
        textAlign={isXs ? "center" : "left"}
      >
        Tus seguros activos
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : seguros.length === 0 ? (
        <Typography
          variant={isXs ? "body2" : "body1"}
          color="text.secondary"
          textAlign="center"
          mt={2}
        >
          Aún no tienes seguros contratados o tus contratos están pendientes
          de aprobación.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {seguros.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id_usuario_seguro}>
              <Card
                sx={{
                  backgroundColor: "#f5f5f5",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent>
                  <Typography
                    variant={isXs ? "subtitle1" : "h6"}
                    color="#0D2B81"
                    gutterBottom
                  >
                    {s.nombre}
                  </Typography>
                  <Typography
                    variant={isXs ? "body2" : "body2"}
                    sx={{ mb: 1 }}
                  >
                    💲 Modalidad:{" "}
                    <strong>
                      {s.modalidad_pago
                        ? s.modalidad_pago.toLowerCase()
                        : "mensual"}
                    </strong>
                  </Typography>
                  <Typography variant={isXs ? "body2" : "body2"}>
                    💲 Costo: ${s.precio ?? "—"}
                  </Typography>
                  <Typography
                    variant={isXs ? "body2" : "body2"}
                    sx={{ mt: 1 }}
                  >
                    ⏳ Siguiente pago en:{" "}
                    <strong>
                      {s.proximo_vencimiento
                        ? `${calcularDiasRestantes(
                            s.proximo_vencimiento
                          )} días`
                        : "—"}
                    </strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* GIF decorativo */}
      <Box mt={6} display="flex" justifyContent="center">
        <Box
          component="img"
          src="/Img/GifCliente.gif"
          alt="Bienvenida visual"
          sx={{
            width: { xs: "100%", sm: "80%", md: "60%" },
            maxWidth: "600px",
            borderRadius: "16px",
          }}
        />
      </Box>
    </Box>
  );
};

export default Cliente;
