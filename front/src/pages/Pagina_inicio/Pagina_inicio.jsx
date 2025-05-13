"use client";
import React from 'react';
import './Pagina_inicio.css';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { useContext } from 'react';

export const Pagina_inicio = ({ }) => {
	const navigate = useNavigate();

	const inicio_login = () => {
		navigate('/login', { replace: true });
	};

	return (
		<Box
			sx={{
				height: '100vh',
				background: 'linear-gradient(to bottom right, #e3f2fd, #90caf9)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				px: 2,
			}}
		>
			<Container
				maxWidth="sm"
				sx={{
					bgcolor: 'white',
					p: 5,
					borderRadius: 3,
					boxShadow: 4,
					textAlign: 'center',
				}}
			>
				<Typography variant="h4" fontWeight={700} gutterBottom color="primary">
					Plataforma de Seguros
				</Typography>
				<Typography variant="body1" color="text.secondary" mb={4}>
					Bienvenido, accede para gestionar tu cobertura, planes y beneficios.
				</Typography>
				<Button variant="contained" color="error" onClick={inicio_login}>
					Ingresar
				</Button>
			</Container>
		</Box>
	);
};

Pagina_inicio.propTypes = {};
