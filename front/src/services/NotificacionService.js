import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:3030' });

export const getNotificaciones = (id_usuario) =>
  API.get(`/notificaciones/usuario/${id_usuario}`);
