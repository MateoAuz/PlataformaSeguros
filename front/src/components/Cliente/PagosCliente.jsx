// src/components/Cliente/PagosCliente.jsx
"use client";

import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import { UserContext } from "../../context/UserContext";
import { getPagos, confirmarDebito } from "../../services/PagoService";

const estadoLabels = {
  realizado: { label: "Realizado", color: "success" },
  proximo: { label: "Próximo", color: "warning" },
  vencido: { label: "Vencido", color: "error" }
};

const PagosCliente = () => {
  const { user } = useContext(UserContext);
  const [pagos, setPagos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (!user?.id_usuario) return;
    getPagos(user.id_usuario)
      .then(res => setPagos(res.data))
      .catch(err => {
        console.error("Error al cargar pagos:", err);
        setSnackbar({ open: true, message: "No se pudieron cargar los pagos", severity: "error" });
      });
  }, [user]);

  // si no hay ningún pago, mostramos mensaje
  if (pagos.length === 0) {
    return (
      <Box textAlign="center" mt={6}>
        <Typography variant="h6" color="text.secondary">
          No hay pagos registrados todavía.
        </Typography>
      </Box>
    );
  }

  // si existen pagos, renderizamos la tabla
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81">
        Cronograma de Pagos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha de Pago</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagos.map(pago => {
              let key = "proximo";
              if (pago.estado_pago === 1) key = "realizado";
              else if (pago.estado_pago === 2) key = "vencido";
              const { label, color } = estadoLabels[key];

              return (
                <TableRow key={pago.id_pago_seguro}>
                  <TableCell>{new Date(pago.fecha_pago).toLocaleDateString()}</TableCell>
                  <TableCell align="right">${pago.cantidad.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <Chip label={label} color={color} />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<GetAppIcon />}
                      onClick={() =>
                        window.open(
                          `http://localhost:3030/pagos/orden/${pago.id_pago_seguro}`,
                          "_blank"
                        )
                      }
                    >
                      Orden
                    </Button>
                    <Button
                      size="small"
                      sx={{ ml: 1 }}
                      disabled={pago.estado_pago !== 0}
                      onClick={() => confirmarDebito(pago).then(() => {
                        // refrescar estado localmente...
                        setPagos(prev =>
                          prev.map(p =>
                            p.id_pago_seguro === pago.id_pago_seguro
                              ? { ...p, estado_pago: 1 }
                              : p
                          )
                        );
                        setSnackbar({ open: true, message: "Débito automático confirmado", severity: "success" });
                      })}
                    >
                      Débito auto.
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagosCliente;
