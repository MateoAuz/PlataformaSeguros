"use client";
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import './BotonAccion.css';

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