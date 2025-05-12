"use client";
import React, { useState } from 'react';
import './Login.css';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const Login = () => {

	const navigate = useNavigate();
	const regresar = () =>{
		navigate('/',{replace:true});
	};

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const handleLogin = async (e) => {
		e.preventDefault();

		if (username.trim() === '' || password.trim() === '') {
			setError('Todos los campos son obligatorios.');
			return;
		}

		try {
			const res = await fetch("http://localhost:3030/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ correo: username, password })
			});

			const data = await res.json();

			if (!res.ok) {
			setError(data.error || 'Error al iniciar sesión');
			return;
			}

			localStorage.setItem("tipoUsuario", data.tipo);

			switch (data.tipo) {
			case 0:
				navigate('/admin', { replace: true });
				break;
			case 1:
				navigate('/agente', { replace: true });
				break;
			case 2:
				navigate('/cliente', { replace: true });
				break;
			default:
				setError('Tipo de usuario no reconocido');
			}

		} catch (err) {
			console.error(err);
			setError('Error de conexión al servidor');
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
		<img src="/logo.png" alt="Logo Seguros" className="logo-seguro" />
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
