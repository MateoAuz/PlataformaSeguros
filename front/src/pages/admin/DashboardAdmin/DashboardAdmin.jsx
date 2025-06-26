"use client";
import { Route, Routes } from 'react-router-dom';
import { Bienvenida } from '../../../components/Bienvenida';
import { Clientes } from '../../../components/Clientes';
import { Contratacion } from '../../../components/Contratacion';
import { MenuAdmin } from '../../../components/MenuAdmin';
import { PerfilUsuario } from '../../../components/PerfilUsuario/PerfilUsuario';
import { Reportes } from '../../../components/Reportes';
import { Revision } from '../../../components/Revision';
import { Seguros } from '../../../components/Seguros';
import { Usuarios } from '../../../components/Usuarios/Usuarios';
import './DashboardAdmin.css';


export const DashboardAdmin = () => {
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
