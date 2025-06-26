import axios from 'axios';
import { BaseUrl } from '../shared/conexion';

const API_BASE = `${BaseUrl.BASE_URL}`;
// Obtener todos los seguros activos (sin filtro de usuario)
export const getSeguros = () => axios.get(`${API_BASE}/seguros`);

// Obtener seguros disponibles para un usuario
export const getSegurosDisponibles = (idUsuario) =>
  axios.get(`${API_BASE}/seguros/disponibles/${idUsuario}`);

// Crear un nuevo seguro
export const crearSeguro = (datos) => axios.post(`${API_BASE}/seguros`, datos);

// Editar un seguro existente
export const editarSeguro = (id, datos) => axios.put(`${API_BASE}/seguros/${id}`, datos);

// Desactivar un seguro (cambiar su estado a inactivo)
export const desactivarSeguro = (id) => axios.put(`${API_BASE}/seguros/desactivar/${id}`);

// Obtener seguros inactivos
export const getSegurosInactivos = () => axios.get(`${API_BASE}/seguros/inactivos`);

// Activar un seguro
export const activarSeguro = (id) => axios.put(`${API_BASE}/seguros/activar/${id}`);

// Asociaciones
export const asociarCoberturas = (id_seguro, ids) =>
  axios.post(`${API_BASE}/seguros/coberturas`, { id_seguro, ids });

export const asociarBeneficios = (id_seguro, ids) =>
  axios.post(`${API_BASE}/seguros/beneficios`, { id_seguro, ids });

export const asociarRequisitos = (id_seguro, ids) =>
  axios.post(`${API_BASE}/seguros/requisitos`, { id_seguro, ids });

export const contarSegurosActivos = () =>
  axios.get(`${BaseUrl.BASE_URL}/seguros/activos`);