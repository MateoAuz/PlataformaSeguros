"use client";
import React from 'react';
import './DashboardAdmin.css';
import PropTypes from 'prop-types';
import { MenuAdmin } from '../../../components/MenuAdmin';

export const DashboardAdmin = ({}) => {
	return (
		<div className='dashboardadmin'>
			<MenuAdmin></MenuAdmin>
 		</div>
	);
};

DashboardAdmin.propTypes = {};
