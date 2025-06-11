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

			// Si hay URL directa, se abre directamente
			if (urlDirecta) {
				window.open(urlDirecta, '_blank');
				return;
			}

			// Si no hay URL directa, se consulta al backend
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
	urlDirecta: PropTypes.string,          // Si tienes la URL completa del archivo (por ejemplo, S3)
	rutaDescarga: PropTypes.string,        // Si necesitas hacer una petición GET/POST a tu backend
	metodo: PropTypes.oneOf(['GET', 'POST']) // Método HTTP si usas rutaDescarga
};