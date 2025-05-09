"use client";
import React from 'react';
import './NOT_FOUND.css';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export const NOT_FOUND = ({ }) => {
	const navigate = useNavigate();

	const regresar = () => {
		navigate('/', { replace: true });
	};

	return (
		<div className='not_found'>
			<div className="not_found_card">
				<Typography variant="h2" color="error" className="not_found_title">
					404
				</Typography>
				
				<Typography variant="h5" className="not_found_subtitle">
					Pagina no encontrada
				</Typography>

				<Typography variant="body1" className="not_found_text">
					Lo sentimos pero la pagina que estas buscando no existe.
				</Typography>

				<Button variant="contained" color="error" onClick={regresar}>
					Regresar al inicio
				</Button>
			</div>
		</div>
	);
};

NOT_FOUND.propTypes = {};
