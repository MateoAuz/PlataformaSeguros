"use client";
import React, { useEffect, useState } from 'react';
import {
	Box, Typography, Paper, Table, TableHead, TableBody,
	TableRow, TableCell, Button, CircularProgress, Snackbar, Alert
} from '@mui/material';
import { getSolicitudesPendientes, aceptarContrato, rechazarContrato } from '../../services/ContratoService';
import { DetalleSolicitudAgente } from './DetalleSolicitudAgente';

import './Contratacion.css';

export const Contratacion = () => {
	const [solicitudes, setSolicitudes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
	const [detalleAbierto, setDetalleAbierto] = useState(false);
	const [idSeleccionado, setIdSeleccionado] = useState(null);

	const cargarSolicitudes = () => {
		getSolicitudesPendientes()
			.then(res => {
				setSolicitudes(res.data);
				setLoading(false);
			})
			.catch(err => {
				console.error('Error al cargar solicitudes:', err);
				setSnackbar({ open: true, message: 'Error al cargar solicitudes', severity: 'error' });
				setLoading(false);
			});
	};

	useEffect(() => {
		cargarSolicitudes();
	}, []);

	const handleDecision = async (id, accion) => {
		try {
			if (accion === 'aceptar') {
				await aceptarContrato(id);
			} else {
				await rechazarContrato(id);
			}
			setSnackbar({ open: true, message: `Contrato ${accion === 'aceptar' ? 'aceptado' : 'rechazado'}`, severity: 'success' });
			cargarSolicitudes();
		} catch (err) {
			console.error('Error al actualizar contrato:', err);
			setSnackbar({ open: true, message: 'Error al procesar la decisión', severity: 'error' });
		}
	};

	return (
		<Box p={4} className="revision">
			<Typography variant="h4" gutterBottom color="primary">
				Solicitudes de Contratación Pendientes
			</Typography>

			{loading ? <CircularProgress sx={{ mt: 4 }} /> : (
				<Paper elevation={3}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell><strong>Cliente</strong></TableCell>
								<TableCell><strong>Seguro</strong></TableCell>
								<TableCell><strong>Tipo</strong></TableCell>
								<TableCell><strong>Pago</strong></TableCell>
								<TableCell><strong>Fecha</strong></TableCell>
								<TableCell><strong>Acción</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{solicitudes.map(s => (
								<TableRow key={s.id_usuario_seguro}>
									<TableCell>{s.nombre_usuario} {s.apellido}</TableCell>
									<TableCell>{s.nombre_seguro}</TableCell>
									<TableCell>{s.tipo}</TableCell>
									<TableCell>{s.tiempo_pago}</TableCell>
									<TableCell>{s.fecha_contrato}</TableCell>
									<TableCell>
										<Button
											variant="outlined"
											size="small"
											onClick={() => {
												setIdSeleccionado(s.id_usuario_seguro);
												setDetalleAbierto(true);
											}}
											sx={{ mb: 1 }}
										>
											Ver Detalle
										</Button><br />
										<Button variant="outlined" color="success" size="small" onClick={() => handleDecision(s.id_usuario_seguro, 'aceptar')}>Aceptar</Button>
										<Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDecision(s.id_usuario_seguro, 'rechazar')}>Rechazar</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Paper>
			)}


			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar(s => ({ ...s, open: false }))}
			>
				<Alert severity={snackbar.severity} sx={{ width: '100%' }}>
					{snackbar.message}
				</Alert>
			</Snackbar>

			{detalleAbierto && (
				<DetalleSolicitudAgente
					open={detalleAbierto}
					idContrato={idSeleccionado}
					onClose={() => {
						setDetalleAbierto(false);
						setIdSeleccionado(null);
					}}
				/>
			)}
		</Box>
	);
};

Contratacion.propTypes = {};
