"use client";
import React, { useState } from 'react';
import './MenuAdmin.css';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListItemIcon from '@mui/material/ListItemIcon';



export const MenuAdmin = ({ }) => {
	const [auth, setAuth] = useState(true);
	const [anchorEl, setAnchorEl] = useState(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const handleMenu = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const toggleDrawer = () => {
		setDrawerOpen((prev) => !prev);
	};

	return (
		<Box >
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
					<img src="/logo.png" alt="Logo" className='logo' style={{ height: '50px', marginRight: '10px' }} />
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
								<MenuItem onClick={handleClose}>Cambiar Contraseña</MenuItem>
								<MenuItem onClick={handleClose}>Cerrar sesión</MenuItem>
							</Menu>
						</div>
					)}
				</Toolbar>
			</AppBar>

			<Drawer
				variant="persistent"
				anchor="left"
				open={drawerOpen}
				sx={{
					width: 250,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: 250,
						boxSizing: 'border-box',
						backgroundColor: '#2C4C40',
						color: 'white'
					},
				}}
			>
				<Toolbar />
				<Box sx={{ overflow: 'auto' }}>
					<List>
						<ListItem button>
							<ListItemIcon>
								<PeopleIcon />
							</ListItemIcon>
							<ListItemText primary="Usuarios" />
						</ListItem>

						<ListItem button>
							<ListItemIcon>
								<SecurityIcon />
							</ListItemIcon>
							<ListItemText primary="Seguros" />
						</ListItem>

						<ListItem button>
							<ListItemIcon>
								<PersonIcon />
							</ListItemIcon>
							<ListItemText primary="Clientes" />
						</ListItem>

						<ListItem button>
							<ListItemIcon>
								<AssignmentIcon />
							</ListItemIcon>
							<ListItemText primary="Contratación" />
						</ListItem>

						<ListItem button>
							<ListItemIcon>
								<RateReviewIcon />
							</ListItemIcon>
							<ListItemText primary="Revisión" />
						</ListItem>

						<ListItem button>
							<ListItemIcon>
								<BarChartIcon />
							</ListItemIcon>
							<ListItemText primary="Reporte" />
						</ListItem>
					</List>
				</Box>

			</Drawer>

			<Box
				component="main"
				sx={{ flexGrow: 1, p: 3, marginLeft: drawerOpen ? '250px' : '0', transition: 'margin 0.3s' }}
			>
				<Toolbar />
				{/* Aquí va el contenido principal */}
				<Typography paragraph>
					Bienvenido al sistema de gestión educativa.
				</Typography>
			</Box>
		</Box>
	);
};

MenuAdmin.propTypes = {};
