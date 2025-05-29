// src/services/ContratoService.js
import axios from 'axios';

const API_BASE = 'http://localhost:3030';

// POST para crear un contrato como JSON
export function crearContrato(data) {
  return axios.post(`${API_BASE}/usuario_seguro`, data);
}

// GET para listar contratos de un usuario
export const getContratos = (userId) => {
  return axios.get(`${API_BASE}/contratos/usuario/${userId}`);
};

// URL para descargar el PDF de un contrato
export const descargarContrato = (idContrato) => {
  return `${API_BASE}/contratos/pdf/${idContrato}`;
};
