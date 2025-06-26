"use client";
import { Box, Typography } from '@mui/material';
import './SeccionTitulo.css';

const SeccionTitulo = ({ titulo, children }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5">{titulo}</Typography>
      {children}
    </Box>
  );
};

export default SeccionTitulo;