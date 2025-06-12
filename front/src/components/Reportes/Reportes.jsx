"use client";
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, Divider, Collapse, IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  getContratosAceptados,
  getDetalleContratoSimple
} from '../../services/ContratoService';
import {
  getPagosPorContrato,
  confirmarDebito as confirmarPago,
  denegarPago
} from '../../services/PagoService';
import { BotonVerArchivo } from "../../components/BotonVerArchivo";


export const Reportes = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleContrato, setDetalleContrato] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pagosVisibles, setPagosVisibles] = useState({});
  const [pagosPorContrato, setPagosPorContrato] = useState({});

  useEffect(() => {
    getContratosAceptados()
      .then(res => setContratos(res.data))
      .catch(err => console.error('Error al cargar contratos:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (id) => {
    getDetalleContratoSimple(id)
      .then(res => {
        setDetalleContrato(res.data);
        setDialogOpen(true);
      })
      .catch(() => alert("Error al cargar detalles"));
  };

  const handleClose = () => {
    setDialogOpen(false);
    setDetalleContrato(null);
  };

  const togglePagos = async (idContrato) => {
    const isOpen = pagosVisibles[idContrato];
    if (!isOpen && !pagosPorContrato[idContrato]) {
      try {
        const res = await getPagosPorContrato(idContrato);
        setPagosPorContrato(prev => ({ ...prev, [idContrato]: res.data }));
      } catch (err) {
        console.error("Error al obtener pagos del contrato:", err);
      }
    }
    setPagosVisibles(prev => ({ ...prev, [idContrato]: !isOpen }));
  };

  const evaluarPago = async (idPago, accion, idContrato) => {
    try {
      if (accion === 'confirmar') {
        await confirmarPago(idPago);
      } else {
        await denegarPago(idPago);
      }

      // Refrescar los pagos
      const res = await getPagosPorContrato(idContrato);
      setPagosPorContrato(prev => ({ ...prev, [idContrato]: res.data }));
    } catch (err) {
      alert('Error al procesar el pago');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81" fontWeight="bold">
        Reporte de Contratos Aceptados
      </Typography>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : contratos.length === 0 ? (
        <Typography>No hay contratos aceptados aún.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell><strong>Cliente</strong></TableCell>
                <TableCell><strong>Seguro</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Pago</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
                <TableCell><strong>Acción</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contratos.map((c) => (
                <React.Fragment key={c.id_usuario_seguro}>
                  <TableRow>
                    <TableCell>
                      <IconButton size="small" onClick={() => togglePagos(c.id_usuario_seguro)}>
                        {pagosVisibles[c.id_usuario_seguro]
                          ? <KeyboardArrowUpIcon />
                          : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{c.nombre_usuario} {c.apellido_usuario}</TableCell>
                    <TableCell>{c.nombre_seguro}</TableCell>
                    <TableCell>{c.tipo}</TableCell>
                    <TableCell>{c.modalidad_pago}</TableCell>
                    <TableCell>{c.fecha_contrato}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpen(c.id_usuario_seguro)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Collapse in={pagosVisibles[c.id_usuario_seguro]} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            Pagos realizados
                          </Typography>

                          {pagosPorContrato[c.id_usuario_seguro]?.length ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell><strong>Seguro</strong></TableCell>
                                  <TableCell><strong>Fecha</strong></TableCell>
                                  <TableCell><strong>Monto</strong></TableCell>
                                  <TableCell><strong>Comprobante</strong></TableCell>
                                  <TableCell><strong>Evaluación</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {pagosPorContrato[c.id_usuario_seguro].map((pago, i) => {
                                  const esUltimo = i === 0;
                                  return (
                                    <TableRow key={pago.id_pago_seguro}>
                                      <TableCell>{pago.nombre_seguro || 'N/A'}</TableCell>
                                      <TableCell>{new Date(pago.fecha_pago).toLocaleDateString()}</TableCell>
                                      <TableCell>${parseFloat(pago.cantidad).toFixed(2)}</TableCell>
                                      <TableCell>
                                        {pago.comprobante_pago ? (
                                          <BotonVerArchivo
                                            rutaDescarga={`http://localhost:3030/pagos/descarga/${pago.id_pago_seguro}`}
                                          />
                                        ) : (
                                          "Sin archivo"
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {esUltimo ? (
                                          pago.estado_pago === 1 ? (
                                            <Typography color="green">Confirmado</Typography>
                                          ) : pago.estado_pago === 0 ? (
                                            <Typography color="red">Cancelado</Typography>
                                          ) : (
                                            <>
                                              <Button
                                                size="small"
                                                color="success"
                                                onClick={async () => {
                                                  await evaluarPago(pago.id_pago_seguro, 'confirmar', c.id_usuario_seguro);
                                                  // actualización manual del estado en frontend
                                                  setPagosPorContrato(prev => {
                                                    const actualizados = [...prev[c.id_usuario_seguro]];
                                                    actualizados[0] = { ...actualizados[0], estado_pago: 1 };
                                                    return { ...prev, [c.id_usuario_seguro]: actualizados };
                                                  });
                                                }}
                                              >
                                                Confirmar
                                              </Button>
                                              <Button
                                                size="small"
                                                color="error"
                                                onClick={async () => {
                                                  await evaluarPago(pago.id_pago_seguro, 'denegar', c.id_usuario_seguro);
                                                  setPagosPorContrato(prev => {
                                                    const actualizados = [...prev[c.id_usuario_seguro]];
                                                    actualizados[0] = { ...actualizados[0], estado_pago: 0 };
                                                    return { ...prev, [c.id_usuario_seguro]: actualizados };
                                                  });
                                                }}
                                              >
                                                Denegar
                                              </Button>
                                            </>
                                          )
                                        ) : (
                                          '-' // Pagos anteriores muestran guion
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No se registran pagos aún.</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0D2B81', color: 'white' }}>
          Detalle del Contrato
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {detalleContrato ? (
            <Box>
              <Typography variant="h6" gutterBottom color="primary">Datos del Seguro</Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                <Typography><strong>Seguro:</strong> {detalleContrato.nombre_seguro}</Typography>
                <Typography><strong>Tipo:</strong> {detalleContrato.tipo}</Typography>
                <Typography><strong>Precio:</strong> ${detalleContrato.precio}</Typography>
                <Typography><strong>Modalidad de pago:</strong> {detalleContrato.modalidad_pago}</Typography>
                <Typography><strong>Cobertura:</strong> ${detalleContrato.cobertura}</Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">Beneficios</Typography>
              <ul>
                {detalleContrato.beneficios?.map((b, i) => <li key={i}>{b}</li>)}
              </ul>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">Beneficiarios</Typography>
              {detalleContrato.beneficiarios?.length ? (
                <ul>
                  {detalleContrato.beneficiarios.map((b, i) => (
                    <li key={i}><strong>{b.nombre}</strong> – {b.parentesco} – <em>{b.cedula}</em></li>
                  ))}
                </ul>
              ) : (
                <Typography>No hay beneficiarios registrados.</Typography>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">Requisitos</Typography>
              <ul>
                {detalleContrato.requisitos?.map((r, i) => (
                  <li key={i}>
                    {r.nombre}{" "}
                    {r.archivo ? (
                      <a href={`http://localhost:3030/${r.archivo}`} target="_blank" rel="noreferrer">
                        Ver archivo
                      </a>
                    ) : (
                      <span style={{ color: 'gray' }}>No cargado</span>
                    )}
                  </li>
                ))}
              </ul>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">Firma Electrónica</Typography>
              <a href={`http://localhost:3030/${detalleContrato.firma}`} target="_blank" rel="noreferrer">
                Ver firma
              </a>
            </Box>
          ) : (
            <Typography>Cargando detalles...</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
