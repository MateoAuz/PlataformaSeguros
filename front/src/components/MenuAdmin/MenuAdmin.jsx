"use client";
import React, { useState } from 'react';
import './MenuAdmin.css';
import PropTypes from 'prop-types';
import {
	AppBar, Box, Toolbar, Typography, IconButton,
	MenuItem, Menu, Drawer, List, ListItem, ListItemText,
	ListItemIcon, useTheme, useMediaQuery
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BarChartIcon from '@mui/icons-material/BarChart';
import HomeIcon from '@mui/icons-material/Home';

import { useNavigate } from 'react-router-dom';

export const MenuAdmin = ({ children }) => {
	const [auth, setAuth] = useState(true);
	const [anchorEl, setAnchorEl] = useState(null);

	const theme = useTheme();
	const esPantallaChica = useMediaQuery(theme.breakpoints.down('sm'));
	const [drawerOpen, setDrawerOpen] = useState(!esPantallaChica);

	const handleMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const toggleDrawer = () => {
		setDrawerOpen(prev => !prev);
	};

	const navigate = useNavigate();

	const inicio_login = () => {
		localStorage.removeItem("usuario");
		setAuth(false);
		navigate('/login', { replace: true });
	};

	const handleNavigate = (ruta) => {
		navigate(ruta);
		if (esPantallaChica) setDrawerOpen(false);
	};

	return (
		<Box sx={{ display: 'flex' }}>
			<AppBar
				position="fixed"
				sx={{
					zIndex: (theme) => theme.zIndex.drawer + 1,
					backgroundColor: '#002980'
				}}
			>
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={toggleDrawer}
					>
						<MenuIcon />
					</IconButton>
					<IconButton
						color="inherit"
						onClick={() => navigate('/admin')}
						sx={{ mr: 1 }}
					>
						<HomeIcon />
					</IconButton>
					<img src="/logo.png" alt="Logo" className="logo" style={{ height: '50px', marginRight: '10px' }} />
					<Typography
						variant="h6"
						component="div"
						sx={{ flexGrow: 1, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
					>
						SISTEMA DE SEGUROS "Vida Plena"
					</Typography>
					{auth && (
						<div>
							<IconButton
								size="large"
								aria-label="account of current user"
								aria-controls="menu-appbar"
								aria-haspopup="true"
								onClick={handleMenu}
								color="inherit"
							>
								<AccountCircle />
							</IconButton>
							<Menu
								id="menu-appbar"
								anchorEl={anchorEl}
								anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
								keepMounted
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								open={Boolean(anchorEl)}
								onClose={handleClose}
							>
								<MenuItem onClick={() => { handleClose(); navigate('/admin/perfil'); }}>
									Perfil
								</MenuItem>
								<MenuItem onClick={inicio_login}>Cerrar sesión</MenuItem>
							</Menu>
						</div>
					)}
				</Toolbar>
			</AppBar>

			<Drawer
				variant={esPantallaChica ? 'temporary' : 'persistent'}
				open={drawerOpen}
				onClose={toggleDrawer}
				sx={{
					display: { xs: 'block', sm: 'block' },
					'& .MuiDrawer-paper': {
						width: 250,
						boxSizing: 'border-box',
						backgroundColor: '#63A6B0',
						color: 'white',
					},
				}}
			>
				<Toolbar />
				<Box sx={{ overflow: 'auto' }}>
					<List>
						<ListItem button onClick={() => handleNavigate('/admin/usuarios')}>
							<ListItemIcon><PeopleIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Usuarios" />
						</ListItem>
						<ListItem button onClick={() => handleNavigate('/admin/seguros')}>
							<ListItemIcon><SecurityIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Seguros" />
						</ListItem>
						<ListItem button onClick={() => handleNavigate('/admin/clientes')}>
							<ListItemIcon><PersonIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Clientes" />
						</ListItem>
						<ListItem button onClick={() => handleNavigate('/admin/contratacion')}>
							<ListItemIcon><AssignmentIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Contratación" />
						</ListItem>
						<ListItem button onClick={() => handleNavigate('/admin/revision')}>
							<ListItemIcon><RateReviewIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Revisión" />
						</ListItem>
						<ListItem button onClick={() => handleNavigate('/admin/reportes')}>
							<ListItemIcon><BarChartIcon sx={{ color: 'white' }} /></ListItemIcon>
							<ListItemText primary="Reporte" />
						</ListItem>
					</List>
				</Box>
			</Drawer>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: { xs: 2, sm: 3 },
					ml: esPantallaChica ? 0 : (drawerOpen ? '250px' : 0),
					transition: 'all 0.3s ease',
					width: '100%',
					boxSizing: 'border-box',
				}}
			>
				<Toolbar />
				{children}
			</Box>
		</Box>
	);
};

MenuAdmin.propTypes = {
	children: PropTypes.node
};
