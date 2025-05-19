"use client";
import React from 'react';
import './DashboardAdmin.css';
import PropTypes from 'prop-types';
import { MenuAdmin } from '../../../components/MenuAdmin';
import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Usuarios } from '../../../components/Usuarios/Usuarios';
import { Bienvenida } from '../../../components/Bienvenida';
import { Seguros } from '../../../components/Seguros';
import { Clientes } from '../../../components/Clientes';
import { Contratacion } from '../../../components/Contratacion';
import { Revision } from '../../../components/Revision';
import { Reportes } from '../../../components/Reportes';
import { PerfilUsuario } from '../../../components/PerfilUsuario/PerfilUsuario';


export const DashboardAdmin = ({ }) => {
	return (

		<div className='dashboardadmin'>
			<MenuAdmin>
				<Routes>
					{/* Ruta por defecto cuando entras a /admin */}
					<Route index element={<Bienvenida />} />
					<Route path="usuarios" element={<Usuarios />} />
					<Route path="seguros" element={<Seguros />} />
					<Route path="clientes" element={<Clientes />} />
					<Route path="contratacion" element={<Contratacion />} />
					<Route path="revision" element={<Revision />} />
					<Route path="reportes" element={<Reportes />} />
					<Route path="perfil" element={<PerfilUsuario />} />
				</Routes>
			</MenuAdmin>
		</div>
	);
};

DashboardAdmin.propTypes = {};
