import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:3030' });

/** 
+ * Devuelve la lista de notificaciones para un usuario.
+ */
export function getNotificaciones(userId) {
  // usa la instancia API, no axios.get con un objeto en string.
  return API.get(`/notificaciones/cliente/${userId}`);
}

export function clearNotificaciones(userId) {
  return API.delete(`/notificaciones/cliente/${userId}`);
}
