"use client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Button, MobileStepper, Paper, Fade, Grow } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Seguros from '../../components/Seguros/Seguros';



const images = [
	{
		label: 'Seguridad',
		imgPath: '/img/1.jpg',
	},
	{
		label: 'Familia',
		imgPath: '/img/2.jpg',
	},
	{
		label: 'Confianza',
		imgPath: '/img/3.jpg',
	},
];



export const PClientes = () => {
	const navigate = useNavigate();
	const maxSteps = images.length;

	const [activeStep, setActiveStep] = useState(0);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	return (
		<Box sx={{ bgcolor: '#fffff', minHeight: '100vh' }}>
			{/* NAVBAR */}
			<AppBar position="static" sx={{ bgcolor: '#90D2CD' }}>
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
						color="#0D2B81"
						noWrap
						sx={{ flexGrow: 1 }}
					>
						Plataforma de seguros médicos - Clientes
					</Typography>

					<Button
						variant="contained"
						color="#D7F1EF"
						size="small"
						sx={{
							fontWeight: 'bold',
							borderRadius: 3,
							px: 2,
							py: 0.5,
							minWidth: 'unset',
							width: 'auto',
							whiteSpace: 'nowrap',
						}}
					>
						<Typography
							variant="h7"
							fontWeight="bold"
							color="#0D2B81"
							noWrap
							sx={{ flexGrow: 1 }}
						>
							Más Información
						</Typography>
					</Button>
				</Toolbar>
			</AppBar>



			{/* HERO SECTION */}
			<Container maxWidth="75%" sx={{
				bgcolor: '#D7F1EF',
				textAlign: 'center',
				py: 8,
				borderRadius: 2,
				boxShadow: 5
			}}>
				<Typography variant="h3" gutterBottom fontWeight="bold" color="#0D2B81">
					Bienvenido a Seguros Vida Plena
				</Typography>
				<Typography variant="h6" color="text.secondary" mb={4}>
					Tu próximo seguro de Confianza.
				</Typography>
				<Typography variant="h6" color="text.secondary" mb={2}>
					Te presentamos nuestra disponibilidad de planes y precios
				</Typography>
			</Container>

			<Container maxWidth="10%" sx={{ py: 3 }}>
				<Paper
					sx={{
						height: 300,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						overflow: 'hidden',
						borderRadius: 0,
						boxShadow: 7,
						border: '0 px solid #0D2B81',
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

							<KeyboardArrowRight />
						</Button>
					}
					backButton={
						<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
							<KeyboardArrowLeft />

						</Button>
					}
				/>
			</Container>
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Typography variant="h4" textAlign="center" color="#0D2B81" gutterBottom>
					Servicios Disponibles
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
					<Grow in={true} timeout={1000}>
						<Box
							sx={{
								flex: 1,
								minWidth: 280,
								border: '0px ',
								borderRadius: 2,
								backgroundColor: '#D7F1EF',
								padding: 3,
								boxShadow: 7,
							}}
						>
							<Typography variant="h6" fontWeight="bold" color="#0D2B81" gutterBottom>
								Básico
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letra
							</Typography>
						</Box>
					</Grow>

					<Grow in={true} timeout={1000}>
						<Box
							sx={{
								flex: 1,
								minWidth: 280,
								border: '0 px',
								borderRadius: 2,
								backgroundColor: '#D7F1EF',
								padding: 3,
								boxShadow: 7,
							}}
						>
							<Typography variant="h6" fontWeight="bold" color="#0D2B81" gutterBottom>
								Plata
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eget tempus nibh. Praesent et consectetur nisi. Aenean commodo pharetra sapien. Curabitur a luctus erat. Aliquam erat volutpat. Phasellus sed semper mauris, ac luctus ex. Donec tortor urna, pulvinar vitae dolor at, elementum placerat sapien
							</Typography>
						</Box>
					</Grow>
					<Grow in={true} timeout={1000}>
						<Box
							sx={{
								flex: 1,
								minWidth: 280,
								border: '0px',
								borderRadius: 2,
								backgroundColor: '#D7F1EF',
								padding: 3,
								boxShadow: 7,
							}}
						>
							<Typography variant="h6" fontWeight="bold" color="#0D2B81" gutterBottom>
								Oro
							</Typography>
							<Typography variant="body2" color="text.secondary">
								There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessar
							</Typography>

						</Box>
					</Grow>
				</Box>
			</Container>

			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Box
					sx={{
						bgcolor: '#D7F1EF',
						borderRadius: 2,
						boxShadow: 7,
						p: 4,
						mt: 4,
					}}
				>
					<Typography variant="h4" textAlign="center" color="#0D2B81" gutterBottom fontWeight="bold">
						Lista de Seguros Disponibles
					</Typography>
					<Seguros />
				</Box>
			</Container>




			<Box
				sx={{
					bgcolor: '#90D2CD',
					color: '#0D2B81',
					py: 6, // aumentamos el padding vertical
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

PClientes.propTypes = {};