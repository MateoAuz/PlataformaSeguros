// src/components/Cliente/SegurosCliente.jsx
"use client";
import React, { useContext, useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip, CircularProgress
} from '@mui/material';
import { getContratos } from '../../services/ContratoService';
import { UserContext } from '../../context/UserContext';

export const SegurosCliente = () => {
    const { user } = useContext(UserContext);
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        if (!user.id_usuario) {
            setLoading(false);  // Detenemos la carga si no hay usuario válido
            return;
        }

        getContratos(user.id_usuario)
            .then(res => setSeguros(res.data))
            .catch(err => console.error('Error al cargar seguros:', err))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return (
            <Box textAlign="center" mt={5}>
                <Typography variant="h6" color="text.secondary">
                    Cargando datos de usuario...
                </Typography>
            </Box>
        );
    }

    if (loading) {
        return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
    }

    if (seguros.length === 0) {
        return (
            <Box textAlign="center" mt={8}>
                <Typography variant="h4" gutterBottom color="#0D2B81">
                    Mis Seguros
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Aún no tienes seguros contratados.
                </Typography>
            </Box>
        );
    }


    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom color="#0D2B81">
                Mis Seguros
            </Typography>

            <Grid container spacing={3}>
                {seguros.map((s) => (
                    <Grid item xs={12} sm={6} md={4} key={s.id_usuario_seguro}>
                        <Card sx={{ backgroundColor: '#f5f5f5' }}>
                            <CardContent>
                                <Typography variant="h6">{s.nombre}</Typography>
                                <Typography variant="body2">Tipo: {s.tipo}</Typography>
                                <Typography variant="body2">
                                    Inicio: {new Date(s.fecha_contrato).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                    Fin: {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : '—'}
                                </Typography>
                                <Chip
                                    label={
                                        s.estado === 1
                                            ? 'Activo'
                                            : s.estado === 2
                                                ? 'Vencido'
                                                : 'Cancelado'
                                    }
                                    color={
                                        s.estado === 1
                                            ? 'success'
                                            : s.estado === 2
                                                ? 'warning'
                                                : 'error'
                                    }
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SegurosCliente;
