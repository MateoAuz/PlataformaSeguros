"use client";
import './Pagina_inicio.css';
import { useNavigate } from 'react-router-dom';

import {
	Button,
	Typography,
	Container,
	Card,
	CardContent,
	CardActions,
	Grid,
	Box
} from '@mui/material';

export const Pagina_inicio = ({ }) => {
	const navigate = useNavigate();

	const inicio_login = () => {
		navigate('/login', { replace: true });
	};

	return (
		<>
			<Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
				<Button
					variant="contained"
					color="error"
					size="small"
					onClick={inicio_login}
					sx={{
						minWidth: 140,
						fontWeight: 'bold',
						textTransform: 'none',
						borderRadius: 2,
						fontSize: '15px'
					}}
				>
					Iniciar sesión
				</Button>
			</Box>

			<Box
				sx={{
					minHeight: '100vh',
					backgroundImage: 'url("/fondo_pagina_inicio.png")',
					backgroundRepeat: 'repeat',
					backgroundSize: 'auto',
					backgroundPosition: 'center',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					pt: 10,
					px: 2,
				}}

			>
				<Container sx={{ textAlign: 'center', mb: 5 }}>
					<Typography
						variant="h4"
						fontWeight={700}
						sx={{
							backgroundColor: 'white',
							color: 'black',
							px: 2,
							py: 1,
							borderRadius: 1,
							textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
							display: 'inline-block'
						}}
					>
						Servicio de contratación de seguro
					</Typography>


				</Container>

				<Container>
					<Grid container spacing={4} justifyContent="center">
						{[
							{
								plan: 'Básico',
								precio: 20,
								items: ['Asistencia médica', 'Consultas básicas', 'Cobertura mínima']
							},
							{
								plan: 'Plata',
								precio: 50,
								items: [
									'Incluye plan básico',
									'Exámenes preventivos',
									'Descuentos en farmacias',
									'Atención odontológica'
								]
							},
							{
								plan: 'Oro',
								precio: 90,
								items: [
									'Incluye plan plata',
									'Cobertura internacional',
									'Hospitalización completa',
									'Reembolsos rápidos',
									'Línea exclusiva',
									'Chequeos anuales premium'
								]
							},
						].map((servicio, i) => (
							<Grid item key={i} xs={12} sm={6} md={4}>
								<Card
									sx={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
										borderRadius: 3,
										boxShadow: 5
									}}
								>
									<CardContent sx={{ textAlign: 'center' }}>
										<Typography variant="h6" fontWeight={600}>
											{servicio.plan}
										</Typography>
										<Typography variant="h4" color="primary">
											${servicio.precio}
											<Typography variant="caption" component="span">
												/mes
											</Typography>
										</Typography>
										{servicio.items.map((item, idx) => (
											<Typography key={idx} variant="body2" color="text.secondary">
												• {item}
											</Typography>
										))}
									</CardContent>
									<CardActions sx={{ justifyContent: 'center', pb: 2 }}>
										<Button variant="contained" size="small">
											Conocer más
										</Button>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				</Container>
			</Box>
		</>
	);
};

Pagina_inicio.propTypes = {};
