"use client";
import React, { useEffect, useState, useContext } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Stack
} from "@mui/material";
import { getNotificaciones } from "../../services/NotificacionService";
import { UserContext } from "../../context/UserContext";

export const NotificacionesCliente = () => {
    const { user } = useContext(UserContext);
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id_usuario) {
            console.warn("Usuario no disponible aún");
            return;
        }

        console.log("Consultando notificaciones para:", user.id_usuario);

        getNotificaciones(user.id_usuario)
            .then((res) => {
                console.log("Respuesta de notificaciones:", res.data);
                setNotificaciones(res.data || []); // evita undefined
            })
            .catch((err) => {
                console.error("Error al obtener notificaciones:", err);
                setNotificaciones([]);
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return (
            <Box textAlign="center" mt={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (notificaciones.length === 0) {
        return (
            <Box textAlign="center" mt={6}>
                <Typography variant="h6" color="text.secondary">
                    No tienes notificaciones recientes.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom color="#0D2B81">
                Notificaciones
            </Typography>

            <Stack spacing={2}>
                {notificaciones.map((n) => (
                    <Alert key={n.id_notificacion} severity="info">
                        {n.mensaje}
                    </Alert>
                ))}
            </Stack>
        </Box>
    );
};

export default NotificacionesCliente;
