"use client";
import React from 'react';
import './Login.css';
import PropTypes from 'prop-types';
import {useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

export const Login = ({}) => {

	const navigate = useNavigate();
	const regresar = () =>{
		navigate('/',{replace:true})
	};
	return (
		<div className='login'>
 			<h1>Inicio de sesion</h1>
 			<h1>Usuario</h1>
			 <Button className='btn_ejemplo' onClick={regresar} variant='outlined' color="error">Salir</Button>
 		</div>
	);
};

Login.propTypes = {};
