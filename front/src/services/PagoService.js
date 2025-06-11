import axios from 'axios';
const API = 'http://localhost:3030';
export function getPagos(idUsuario) {
  // Usa la ruta correcta que SÍ existe en tu backend
  return axios.get(`${API}/pagos/cliente/${idUsuario}`);
}

export function confirmarDebito(idPago) {
  return axios.patch(`${API}/pagos/${idPago}/confirmar`);
}

export function getPagosPorContrato(idContrato) {
  return axios.get(`http://localhost:3030/pagos/contrato/${idContrato}`);
}

export const denegarPago = (idPago) => {
  return axios.patch(`http://localhost:3030/pagos/${idPago}/denegar`);
};

