import axios from 'axios';
const API = 'http://localhost:3030';
export function getPagos(idUsuario) {
  return axios.get(`${API}/usuario/${idUsuario}/pagos`);
}
export function confirmarDebito(idPago) {
  return axios.patch(`${API}/pagos/${idPago}/confirmar`);
}
