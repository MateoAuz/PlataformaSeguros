// src/components/Cliente/ReembolsosCliente.jsx
"use client";
import React, { useState } from 'react';
import {
    Paper, Box, Typography, TextField, Button, IconButton,
    Snackbar, Alert, Divider
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import HistorialReembolsos from './HistorialReembolsos';

const ReembolsosCliente = () => {
    const [formData, setFormData] = useState({
        motivo: '',
        monto: '',
        documentos: [],
        firma: ''
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData(fd => ({ ...fd, documentos: Array.from(files) }));
        } else {
            setFormData(fd => ({ ...fd, [name]: value }));
        }
    };

    const clearField = (field) => {
        setFormData(fd => ({ ...fd, [field]: field === 'documentos' ? [] : '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí deberías hacer la llamada a tu servicio para guardar la solicitud
        console.log('Formulario enviado:', formData);

        setSnackbar({ open: true, message: 'Solicitud enviada correctamente.', severity: 'success' });
        // Opcional: reiniciar
        setFormData({
            motivo: '',
            monto: '',
            documentos: [],
            firma: ''
        });
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 700, mx: 'auto', p: 4, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Solicitud de Reembolso
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleSubmit}>

                <Typography variant="subtitle1" gutterBottom>Motivo</Typography>
                <TextField
                    fullWidth
                    name="motivo"
                    label="Motivo del reembolso"
                    value={formData.motivo}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                />

                <Typography variant="subtitle1" gutterBottom>Monto</Typography>
                <TextField
                    type="number"
                    label="Monto solicitado (USD)"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0 }}
                    fullWidth
                />

                <Typography variant="subtitle1" gutterBottom>Documentos adjuntos</Typography>
                <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                    Subir facturas o certificados
                    <input
                        hidden
                        type="file"
                        name="documentos"
                        multiple
                        accept=".pdf,image/*"
                        onChange={handleChange}
                    />
                </Button>
                {formData.documentos.length > 0 && (
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {formData.documentos.map((f) => f.name).join(', ')}
                        </Typography>
                        <IconButton onClick={() => clearField('documentos')}>
                            <ClearIcon />
                        </IconButton>
                    </Box>
                )}

                <Typography variant="subtitle1" gutterBottom>Firma electrónica</Typography>
                <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        name="firma"
                        label="Nombre completo"
                        value={formData.firma}
                        onChange={handleChange}
                        required
                    />
                    <IconButton onClick={() => clearField('firma')}>
                        <ClearIcon />
                    </IconButton>
                </Box>

                <Box display="flex" justifyContent="space-between">
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Enviar solicitud
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => {
                            setFormData({ motivo: '', monto: '', documentos: [], firma: '' });
                        }}
                    >
                        Limpiar
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

<HistorialReembolsos />

export default ReembolsosCliente;
