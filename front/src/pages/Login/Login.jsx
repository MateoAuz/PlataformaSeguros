"use client";
import React, { useState, useContext } from 'react';
import './Login.css';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { BaseUrl } from '../../shared/conexion';

export const Login = () => {
	const navigate = useNavigate();
	const { setUsuario } = useContext(UserContext);

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	const isEmailValid = (email) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	const regresar = () => {
		navigate('/', { replace: true });
	};

	const handleLogin = async (e) => {
		e.preventDefault();

		if (username.trim() === '' || password.trim() === '') {
			setError('Todos los campos son obligatorios.');
			return;
		}

		if (!isEmailValid(username)) {
			setError('El correo no tiene un formato válido.');
			return;
		}

		try {
			console.log("Enviando:", { correo: username, password: password });

			const res = await fetch(`${BaseUrl.BASE_URL}login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ correo: username, password: password })
			});

			const data = await res.json();
			//console.log("Respuesta del backend:", data);

			if (!res.ok) {
				setError(data.error || 'Error al iniciar sesión');
				return;
			}

			// Guardar datos del usuario en el contexto
			setUsuario(data.usuario);

			// También puedes guardar tipo en localStorage si es necesario
			localStorage.setItem("tipoUsuario", data.usuario.tipo);

			// Redirección por tipo de usuario
			switch (data.usuario.tipo) {
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
			console.error("Error de conexión:", err);
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

			<div
				className="body-background"
				style={{
					backgroundImage: `url(${process.env.PUBLIC_URL}/img/fondo_login.jpg)`,
				}}>
				<div className="box">
					<img src="/logo.png" alt="Logo Seguros" className="logo-seguro" />
					<div className="login">
						<div className="loginBx">
							<h2><FaSignInAlt /> Login</h2>
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
								{error && <p className="mensaje-error">{error}</p>}
								<input type="submit" value="Iniciar Sesión" />
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
