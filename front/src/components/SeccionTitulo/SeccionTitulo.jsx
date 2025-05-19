"use client";
import React from 'react';
import './SeccionTitulo.css';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const SeccionTitulo = ({ titulo, children }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h5">{titulo}</Typography>
      {children}
    </Box>
  );
};

export default SeccionTitulo;