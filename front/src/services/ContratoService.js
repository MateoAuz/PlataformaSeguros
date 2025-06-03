// src/services/ContratoService.js
import axios from 'axios';

const API_BASE = 'http://localhost:3030';

// POST para crear un contrato como JSON
export function crearContrato(data) {
  return axios.post(`${API_BASE}/contratos`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// GET para listar contratos de un usuario
export const getContratos = (userId) => {
  return axios.get(`${API_BASE}/contratos/usuario/${userId}`);
};

// URL para descargar el PDF de un contrato
export const descargarContrato = (idContrato) => {
  return `${API_BASE}/contratos/pdf/${idContrato}`;
};

export const getSolicitudesPendientes = () => {
  return axios.get(`${API_BASE}/contratos/pendientes`);
};

export const aceptarContrato = (id) => {
  return axios.put(`${API_BASE}/contratos/aprobar/${id}`);
};



export const rechazarContrato = (id) => {
  return axios.put(`${API_BASE}/contratos/rechazar/${id}`);
};


// GET para obtener detalle completo de un contrato por ID
export const getDetalleContrato = (idContrato) => {
  return axios.get(`http://localhost:3030/contratos/detalle/${idContrato}`);
};
// GET para listar los seguros disponibles para el usuario
export const getSegurosDisponibles = (userId) => {
  return axios.get(`${API_BASE}/seguros/disponibles/${userId}`);
};



