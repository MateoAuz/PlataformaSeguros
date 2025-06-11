import React, { useState } from "react";
import { Button, Typography, Box } from "@mui/material";

export const SubirArchivo = ({ onArchivoSeleccionado, nombre, tipo = "application/pdf", requerido = false }) => {
  const [archivoNombre, setArchivoNombre] = useState("");

  const handleChange = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setArchivoNombre(archivo.name);
      onArchivoSeleccionado(archivo);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        component="label"
        color={requerido && !archivoNombre ? "warning" : "primary"} // color opcional si requerido
      >
        {nombre || "Seleccionar archivo"}
        <input
          type="file"
          accept={tipo}
          hidden
          onChange={handleChange}
        />
      </Button>

      {archivoNombre && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Archivo seleccionado: <strong>{archivoNombre}</strong>
        </Typography>
      )}
    </Box>
  );
};
