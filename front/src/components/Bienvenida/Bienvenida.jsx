"use client";
import React, { useContext } from 'react';
import './Bienvenida.css';
import { UserContext } from '../../context/UserContext';
import { Typography, Grid, Paper, Button, Alert, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Bienvenida = () => {
	const { usuario } = useContext(UserContext);
	const navigate = useNavigate();

	const fechaActual = new Date().toLocaleDateString();
	const horaActual = new Date().toLocaleTimeString();

	return (
		<div className="bienvenida">
			<Typography variant="h4" gutterBottom>
				Bienvenido(a), {usuario?.nombre || 'Usuario'}
			</Typography>

			<Typography variant="body1" gutterBottom>
				Gracias por utilizar la plataforma <strong>Vida Plena</strong>. Aquí podrás gestionar seguros, clientes y más.
			</Typography>

			<Typography variant="body2" color="textSecondary" gutterBottom>
				{fechaActual} - {horaActual}
			</Typography>

			<Grid container spacing={3} sx={{ mt: 2 }}>
				<Grid item xs={12} sm={4}>
					<Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
						<Typography variant="h6" color="warning.main">Seguros activos</Typography>
						<Typography variant="h4" color="text.primary">42</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
						<Typography variant="h6" color="warning.main">Clientes registrados</Typography>
						<Typography variant="h4" color="text.primary">128</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={4}>
					<Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFF3E0' }}>
						<Typography variant="h6" color="warning.main">Contrataciones pendientes</Typography>
						<Typography variant="h4" color="text.primary">5</Typography>
					</Paper>
				</Grid>
			</Grid>


			{/* Accesos rápidos */}
			<Box sx={{ mt: 4 }}>
				<Typography variant="h6" gutterBottom>Accesos rápidos</Typography>
				<Button variant="contained" sx={{ mr: 2 }} onClick={() => navigate('/admin/clientes')}>
					Gestionar Clientes
				</Button>
				<Button variant="outlined" onClick={() => navigate('/admin/reporte')}>
					Ver Reportes
				</Button>
			</Box>

			{/* Alerta informativa */}
			<Alert severity="info" sx={{ mt: 4 }}>
				Tienes 5 contrataciones pendientes de revisión.
			</Alert>
		</div>
	);
};

Bienvenida.propTypes = {};
