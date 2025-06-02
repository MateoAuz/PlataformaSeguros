import axios from 'axios';
const API_BASE = 'http://localhost:3030';

export const getRequisitosPorSeguro = (idSeguro) => {
  return axios.get(`${API_BASE}/requisito/por-seguro/${idSeguro}`);
};
