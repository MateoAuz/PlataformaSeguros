import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Typography, Button
} from '@mui/material';
import { getDetalleContratoCompleto } from '../../services/ContratoService';
import { BotonVerArchivo } from '../../components/BotonVerArchivo';


const DetalleSolicitudAgente = ({ open, onClose, idContrato }) => {
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    if (open && idContrato) {
      getDetalleContratoCompleto(idContrato)
        .then(res => setDetalle(res.data))
        .catch(() => setDetalle(null));
    }
  }, [open, idContrato]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        🛡️ Detalle de Solicitud
      </DialogTitle>
      <DialogContent dividers>
        {!detalle ? (
          <Typography color="text.secondary">Cargando datos...</Typography>
        ) : (
          <>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Cliente:</strong> {detalle.cliente} {detalle.apellido_cliente}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Fecha:</strong> {detalle.fecha_contrato} – <strong>Hora:</strong> {detalle.hora}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              <strong>Seguro:</strong> {detalle.seguro} ({detalle.tipo})
            </Typography>

            <Typography variant="h6" mt={3}>Beneficiarios</Typography>
            {detalle.beneficiarios?.length ? (
              <ul>
                {detalle.beneficiarios.map((b, i) => (
                  <li key={i}>{b.nombre} – {b.parentesco} – C.I. {b.cedula}</li>
                ))}
              </ul>
            ) : (
              <Typography color="text.secondary">No hay beneficiarios registrados.</Typography>
            )}

            <Typography variant="h6" mt={3}>Documentos Requeridos Adjuntos:</Typography>
            {detalle.requisitos?.length ? (
              <ul>
                {detalle.requisitos.map((r, i) => (
                  <li key={i}>
                    {r.nombre}: {r.archivo ? (
                     <BotonVerArchivo
  rutaDescarga={`http://localhost:3030/contratos/descarga/requisito/${idContrato}/${r.id_requisito}`}
/>
                    ) : (
                      <span>No cargado</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography color="text.secondary">No hay requisitos definidos.</Typography>
            )}
          </>
        )}
        <Button
          onClick={onClose}
          fullWidth
          variant="contained"
          sx={{ mt: 3, bgcolor: '#0D6EFD' }}
        >
          CERRAR
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DetalleSolicitudAgente;
