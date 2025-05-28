import axios from 'axios';

const API = 'http://localhost:3030/seguros';

// Obtener todos los seguros activos
export const getSeguros = () => axios.get(API);

// Crear un nuevo seguro
export const crearSeguro = (datos) => axios.post('http://localhost:3030/seguros', datos);


// Editar un seguro existente
export const editarSeguro = (id, datos) => axios.put(`${API}/${id}`, datos);

// Desactivar un seguro (cambiar su estado a inactivo)
export const desactivarSeguro = (id) => axios.put(`${API}/desactivar/${id}`);

// Obtener seguros inactivos
export const getSegurosInactivos = () => axios.get(`${API}/inactivos`);

// Activar un seguro
export const activarSeguro = (id) => axios.put(`${API}/activar/${id}`);

// Asociaciones (a implementar en backend)
export const asociarCoberturas = (id_seguro, ids) =>
  axios.post(`${API}/coberturas`, { id_seguro, ids });

export const asociarBeneficios = (id_seguro, ids) =>
  axios.post(`${API}/beneficios`, { id_seguro, ids });

export const asociarRequisitos = (id_seguro, ids) =>
  axios.post(`${API}/requisitos`, { id_seguro, ids });

