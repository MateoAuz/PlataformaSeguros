import axios from 'axios';
import { BaseUrl } from '../shared/conexion';
const API = `${BaseUrl.BASE_URL}`;
export function getPagos(idUsuario) {
  // Usa la ruta correcta que SÍ existe en tu backend
  return axios.get(`${API}/pagos/cliente/${idUsuario}`);
}

export function confirmarDebito(idPago) {
  return axios.patch(`${API}/pagos/${idPago}/confirmar`);
}

export function getPagosPorContrato(idContrato) {
  return axios.get(`${BaseUrl.BASE_URL}/pagos/contrato/${idContrato}`);
}

export const denegarPago = (idPago) => {
  return axios.patch(`${BaseUrl.BASE_URL}/pagos/${idPago}/denegar`);
};

