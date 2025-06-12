"use client";
import React, { useState } from 'react';
import './BotonVerArchivo.css';
import PropTypes from 'prop-types';

export const BotonVerArchivo = ({ urlDirecta, rutaDescarga, metodo = 'GET' }) => {
	const [cargando, setCargando] = useState(false);

	const handleClick = async () => {
		if (!urlDirecta && !rutaDescarga) {
			alert("No se ha proporcionado una URL o ruta de descarga");
			return;
		}

		try {
			setCargando(true);

			if (urlDirecta) {
				window.open(urlDirecta, '_blank');
				return;
			}

			const response = await fetch(rutaDescarga, { method: metodo });
			const data = await response.json();

			if (response.ok && data.url) {
				window.open(data.url, '_blank');
			} else {
				alert(data.error || "No se pudo obtener el archivo");
			}
		} catch (error) {
			console.error("Error al obtener archivo:", error);
			alert("Error al abrir archivo");
		} finally {
			setCargando(false);
		}
	};

	return (
		<button onClick={handleClick} disabled={cargando}>
			{cargando ? 'Cargando...' : 'Ver archivo'}
		</button>
	);
};

BotonVerArchivo.propTypes = {
	urlDirecta: PropTypes.string,
	rutaDescarga: PropTypes.string, 
	metodo: PropTypes.oneOf(['GET', 'POST'])
};