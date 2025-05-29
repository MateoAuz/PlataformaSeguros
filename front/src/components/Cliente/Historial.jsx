"use client";
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import HistorialCliente from './HistorialCliente';
import HistorialReembolsos from './HistorialReembolsos';

const Historial = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="#0D2B81">
        Historial
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Contratos" />
        <Tab label="Reembolsos" />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {tab === 0 && <HistorialCliente />}
      {tab === 1 && <HistorialReembolsos />}
    </Box>
  );
};

export default Historial;
