"use client";
import React from 'react';
import './Pagina_inicio.css';
import PropTypes from 'prop-types';
import {useNavigate } from 'react-router-dom';

export const Pagina_inicio = ({}) => {
	const navigate = useNavigate();

	const inicio_login = () =>{
		navigate('/login',{replace:true});
	};

	return (
		<div className='pagina_inicio'>
 			<h1>Hola Mundo desde el home</h1>
 			<h1>Plataforma de seguros</h1>
			 <button onClick={inicio_login}>Ingresar</button>
 		</div>
	);
};

Pagina_inicio.propTypes = {};
