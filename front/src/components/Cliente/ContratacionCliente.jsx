import React, { useEffect, useState } from 'react';
import { 
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress 
} from '@mui/material';
import { getSeguros } from '../../services/SeguroService';
import FormularioContratacion from './FormularioContratacion';

export const ContratacionCliente = () => {
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    getSeguros()
      .then(res => {
        setSeguros(res.data);
        setLoading(false);
      })
      .catch(err => console.error('Error al obtener seguros:', err));
  }, []);


  if (loading) {
    return <CircularProgress sx={{ mt: 5 }} />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81">
        Contratación de Seguros
      </Typography>
      <Typography variant="body1" mb={4}>
        Selecciona un seguro para ver más detalles y proceder con la contratación.
      </Typography>

      {!seleccionado ? (
        seguros.map(seguro => (
          <Card key={seguro.id_seguro} sx={{ maxWidth: 400, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {seguro.nombre}
              </Typography>
              <Typography color="text.secondary">
                Tipo: {seguro.tipo}
              </Typography>
              <Typography color="text.secondary">
                Precio: {seguro.precio}
              </Typography>
              <Typography mt={1}>
                {seguro.descripcion}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: '#0D2B81' }}
                onClick={() => setSeleccionado(seguro)}
              >
                CONTRATAR
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <FormularioContratacion 
          seguro={seleccionado}
          onVolver={() => setSeleccionado(null)}
        />
      )}
    </Box>
  );
};
ContratacionCliente.propTypes = {};
