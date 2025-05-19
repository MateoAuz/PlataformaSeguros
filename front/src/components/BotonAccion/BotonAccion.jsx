"use client";
import React from 'react';
import './BotonAccion.css';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const BotonAccion = ({ texto, onClick, icono = <AddIcon />, color = "primary", ...props }) => {
  return (
    <Button
      variant="contained"
      startIcon={icono}
      onClick={onClick}
      color={color}
      {...props}
    >
      {texto}
    </Button>
  );
};

export default BotonAccion;