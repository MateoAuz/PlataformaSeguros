"use client";
import React from 'react';
import './DashboardAgente.css';
import { MenuAgente } from '../../../components/MenuAgente';
import { Routes, Route } from 'react-router-dom';
import { Bienvenida } from '../../../components/Bienvenida';
import { Clientes } from '../../../components/Clientes';
import { Contratacion } from '../../../components/Contratacion';
import { Revision } from '../../../components/Revision';
import { Reportes } from '../../../components/Reportes';
import { PerfilUsuario } from '../../../components/PerfilUsuario/PerfilUsuario';

export const DashboardAgente = () => {
	return (
		<div className='dashboardagente'>
			<MenuAgente>
				<Routes>
					<Route index element={<Bienvenida />} />
					<Route path="clientes" element={<Clientes />} />
					<Route path="contratacion" element={<Contratacion />} />
					<Route path="revision" element={<Revision />} />
					<Route path="reportes" element={<Reportes />} />
					<Route path="perfil" element={<PerfilUsuario />} />
				</Routes>
			</MenuAgente>
		</div>
	);
};

DashboardAgente.propTypes = {};
