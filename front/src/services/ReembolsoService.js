import axios from 'axios';

const API_BASE = 'http://localhost:3030';

export const getReembolsos = (id_usuario) =>
  axios.get(`${API_BASE}/reembolsos/usuario/${id_usuario}`);
