"use client";
import React from 'react';
import './Seguros_Clientes.css';
import PropTypes from 'prop-types';

export const Seguros_Clientes = ({}) => {
	const [seguros, setSeguros] = useState([]);
	
		const [modalAbierto, setModalAbierto] = useState(false);
		const [seguroSeleccionado, setSeguroSeleccionado] = useState(null);
	
		const abrirModal = (seguro) => {
			setSeguroSeleccionado(seguro);
			setModalAbierto(true);
		};
	
		const cerrarModal = () => {
			setModalAbierto(false);
			setSeguroSeleccionado(null);
		};
	
		useEffect(() => {
			getSeguros()
				.then(res => {
					console.log('Seguros obtenidos:', res.data);
					setSeguros(res.data);
				})
				.catch(err => console.error('Error al obtener seguros:', err));
		}, []);
	
		return (
			<div className="seguros">
				<h2>Seguros Disponibles</h2>
				<table>
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Tipo</th>
							<th>Precio</th>
							<th>Descripción</th>
						</tr>
					</thead>
					<tbody>
						{seguros.map(seguro => (
							<tr key={seguro.id_seguro} onClick={() => abrirModal(seguro)} style={{ cursor: 'pointer' }}>
								<td>{seguro.nombre}</td>
								<td>{seguro.tipo}</td>
								<td>{seguro.precio}</td>
								<td>{seguro.descripcion}</td>
							</tr>
						))}
					</tbody>
				</table>
				<ModalResumenSeguro
					open={modalAbierto}
					onClose={cerrarModal}
					seguro={seguroSeleccionado}
				/>
	
			</div>
		);
};

Seguros_Clientes.propTypes = {};
