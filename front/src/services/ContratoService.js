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
// Nota: ahora apuntamos a “mis-seguros” para recibir también proximo_vencimiento
export const getContratos = (userId) => {
  return axios.get(`${API_BASE}/contratos/mis-seguros/${userId}`);
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

export const getContratosAceptados = () => {
  return axios.get(`${API_BASE}/contratos/aceptados`);
};

export const rechazarContrato = (id, motivo) => {
  return axios.put(
    `${API_BASE}/contratos/rechazar/${id}`,
    { motivo_rechazo: motivo }
  );
};

export const getDetalleContratoSimple = (id) =>
  axios.get(`${API_BASE}/contratos/detalle-simple/${id}`);

export const getDetalleContratoCompleto = (id) =>
  axios.get(`${API_BASE}/contratos/detalle-completo/${id}`);

// GET para listar los seguros disponibles para el usuario
export const getSegurosDisponibles = (userId) => {
  return axios.get(`${API_BASE}/seguros/disponibles/${userId}`);
};
