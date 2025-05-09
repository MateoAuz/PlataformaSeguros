"use client";
import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import logo from './logo.png';
import { useNavigate } from 'react-router-dom';

export const Login = () => {

	const navigate = useNavigate();
	const regresar = () =>{
		navigate('/',{replace:true});
	};

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = (e) => {
		e.preventDefault();

		if (username.trim() === '' || password.trim() === '') {
		setError('Todos los campos son obligatorios.');
		return;
		}

		if (username === 'admin' && password === '1234') {
		alert('Inicio de sesión exitoso');
		setError('');
		} else {
		setError('Credenciales incorrectas.');
		}
	};

  return (
	<>
		<header className="header-seguro-refinado">
			<span className="titulo-seguro">Seguros VidaPlena</span>
			<span className="frase-seguro">| Protegiendo tu salud y bienestar cada día</span>
			<button className='boton-retornar' onClick={regresar}>Retornar</button>
		</header>
	
		<div className="body-background">
		<div className="box">
		<img src={logo} alt="Logo Seguros" className="logo-seguro" />
			<div className="login">
			<div className="loginBx">
				<h2>
				<FaSignInAlt /> Login
				</h2>
				<form onSubmit={handleLogin} style={{ width: '100%' }}>
				<div className="input-field">
					<i><FaUser /></i>
					<input
					type="text"
					placeholder="Correo"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div className="input-field">
					<i><FaLock /></i>
					<input
					type="password"
					placeholder="Contraseña"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				{error && (
					<p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>
					{error}
					</p>
				)}
				<input type="submit" value="Iniciar Sesión" />

				</form>
			</div>
			</div>
		</div>
		</div>
	</>
  );
};
