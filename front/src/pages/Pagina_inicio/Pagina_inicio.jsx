"use client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, MobileStepper, Paper, Fade, Grow } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const images = [
	{
		label: 'Seguro de Vida',
		imgPath: '/seguro_vida.png',
	},
	{
		label: 'Seguro de Salud',
		imgPath: '/seguro_salud.png',
	},
];

export const Pagina_inicio = () => {
	const navigate = useNavigate();
	const maxSteps = images.length;

	const [activeStep, setActiveStep] = useState(0);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const inicio_login = () => {
		navigate('/login', { replace: true });
	};

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
			{/* NAVBAR */}
			<AppBar position="static" sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				background: 'linear-gradient(90deg, #1565c0 0%, rgb(19, 108, 79) 100%)',
				boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
			}}>
				<Toolbar
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexWrap: 'nowrap',
					}}
				>
					<Typography
						variant="h5"
						fontWeight="bold"
						color="white"
						noWrap
						sx={{ flexGrow: 1 }}
					>
						Sistemas Seguros
					</Typography>

					<Button
						variant="contained"
						color="error"
						size="small"
						onClick={inicio_login}
						sx={{
							textTransform: 'none',
							fontWeight: 'bold',
							borderRadius: 2,
							px: 2,
							py: 0.5,
							minWidth: 'unset',
							width: 'auto',
							whiteSpace: 'nowrap',
						}}
					>
						Iniciar sesión
					</Button>
				</Toolbar>
			</AppBar>



			{/* HERO SECTION */}
			<Container maxWidth="md" sx={{
				bgcolor: '#f5f5f5',
				textAlign: 'center',
				py: 6,
				borderRadius: 2,
				boxShadow: 3
			}}>
				<Typography variant="h3" gutterBottom fontWeight="bold" color="#0D2B81">
					Bienvenido a Vida Plena
				</Typography>
				<Typography variant="h6" color="text.secondary" mb={4}>
					Administra tus seguros de vida y salud con facilidad, seguridad y confianza.
				</Typography>
			</Container>


			{/* MISION Y VISION CON HOVER */}
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography variant="h4" textAlign="center" gutterBottom>
					Misión y Visión
				</Typography>

				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'center',
						gap: 4,
						flexWrap: 'wrap',
					}}
				>
					{/* Misión */}
					<Grow in={true} timeout={1000}>
						<Box
							sx={{
								flex: 1,
								minWidth: 280,
								border: '2px solid #0D2B81',
								borderRadius: 2,
								backgroundColor: '#FFF3E0',
								padding: 3,
								boxShadow: 2,
							}}
						>
							<Typography variant="h6" fontWeight="bold" color="#0D2B81" gutterBottom>
								Misión
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Ofrecer soluciones de seguros médicos innovadoras, accesibles y seguras,
								que garanticen el bienestar y la protección de nuestros usuarios a través
								de una plataforma tecnológica transparente y confiable.
							</Typography>
						</Box>
					</Grow>

					{/* Visión */}
					<Grow in={true} timeout={1000}>
						<Box
							sx={{
								flex: 1,
								minWidth: 280,
								border: '2px solid #0D2B81',
								borderRadius: 2,
								backgroundColor: '#FFF3E0',
								padding: 3,
								boxShadow: 2,
							}}
						>
							<Typography variant="h6" fontWeight="bold" color="#0D2B81" gutterBottom>
								Visión
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Consolidarnos como la plataforma digital líder en gestión de seguros médicos
								en Ecuador, destacando por la excelencia en el servicio, la innovación continua
								y el compromiso humano con cada cliente.
							</Typography>
						</Box>
					</Grow>
				</Box>
			</Container>


			{/* CARRUSEL */}
			<Container maxWidth="md" sx={{ py: 6 }}>
				{/* Imagen con fade animado */}
				<Paper
					sx={{
						height: 480,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
						borderRadius: 3,
						boxShadow: 4,
						border: '2px solid #0D2B81',
						position: 'relative',
					}}
				>
					<Fade in={true} timeout={800} key={images[activeStep].imgPath}>
						<img
							src={images[activeStep].imgPath}
							alt={images[activeStep].label}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</Fade>
				</Paper>

				<Typography
					variant="body1"
					color="#0D2B81"
					textAlign="center"
					fontWeight="bold"
					mt={2}
				>
					{images[activeStep].label}
				</Typography>

				<MobileStepper
					variant="dots"
					steps={maxSteps}
					position="static"
					activeStep={activeStep}
					sx={{ bgcolor: 'transparent', justifyContent: 'center', mt: 2 }}
					nextButton={
						<Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
							Siguiente
							<KeyboardArrowRight />
						</Button>
					}
					backButton={
						<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
							<KeyboardArrowLeft />
							Anterior
						</Button>
					}
				/>
			</Container>

			{/* FOOTER */}
			<Box
				sx={{
					bgcolor: '#20603D',
					color: 'white',
					py: 5, // aumentamos el padding vertical
					textAlign: 'center',
					position: 'relative',
					zIndex: 2,
				}}
			>
				<Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
					Contáctanos
				</Typography>
				<Typography variant="body2" sx={{ mb: 0.5 }}>
					📍 Dirección: Av. Los Shyris y Amazonas, Ambato - Ecuador
				</Typography>
				<Typography variant="body2">
					✉️ Correo: contacto@vidaplena.ec &nbsp; | &nbsp; ☎️ Teléfono: +593 3 240 1234
				</Typography>
				<Typography variant="caption" display="block" mt={2}>
					© 2025 Vida Plena – Todos los derechos reservados
				</Typography>
			</Box>

		</Box>
	);
};

Pagina_inicio.propTypes = {};
