"use client";
import React, { useContext } from 'react';
import { Box, Typography } from "@mui/material";
import { UserContext } from "../../context/UserContext";

export const Cliente = () => {
	const { usuario } = useContext(UserContext);

	const fecha = new Date().toLocaleString("es-EC", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<Box sx={{ p: 4 }}>
			<Typography variant="h4" gutterBottom color="#0D2B81">
				Bienvenido(a), {usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario'}
			</Typography>



			<Typography variant="body1" gutterBottom>
				Gracias por utilizar la plataforma <strong>Vida Plena</strong>. Aquí podrás gestionar tus seguros, pagos y solicitudes.
			</Typography>

			<Typography variant="subtitle2" color="text.secondary">
				{fecha}
			</Typography>
		</Box>
	);
};

export default Cliente;
