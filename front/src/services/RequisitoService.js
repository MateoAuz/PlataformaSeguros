import axios from 'axios';
import { BaseUrl } from '../shared/conexion';
const API_BASE = `${BaseUrl.BASE_URL}`;

export const getRequisitosPorSeguro = (idSeguro) => {
  return axios.get(`${API_BASE}/requisito/por-seguro/${idSeguro}`);
};
