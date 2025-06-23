import axios from 'axios';

const API_BASE = 'http://localhost:3030';



/**
 * Trae los seguros contratados (estado = 1) de un usuario
 * @param {number} userId 
 * @returns Promise<[{ id_usuario_seguro, modalidad_pago, estado_pago, nombre, precio}]>
 */
export function fetchSegurosCliente(userId) {
  return axios
    .get(`${API_BASE}/contratos/mis-seguros/${userId}`)
    .then(res => res.data);
}

/**
 * Envía la solicitud de reembolso con archivos
 * @param {FormData} formData 
 */
export function createReembolso(formData) {
  return axios.post(
    `${API_BASE}/reembolsos`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

export function getSolicitudesReembolsos() {
  // ¡OJO! Aquí **no** concatenamos ningún id
  return axios.get(`${API_BASE}/reembolsos/pendientes`);
}

export const getDetalleReembolso = id =>
  axios.get(`${API_BASE}/reembolsos/${id}`);

export const aprobarReembolso = id =>
  axios.put(`${API_BASE}/reembolsos/${id}/aprobar`);

export const rechazarReembolso = (id, motivo_rechazo) => {
  return axios.put(`${API_BASE}/reembolsos/${id}/rechazar`, { motivo_rechazo });
};

export function getHistorialReembolsos(userId) {
  return axios.get(`${API_BASE}/reembolsos/usuario/${userId}`);
}

/**
 * Comprueba si ya hay un reembolso PENDIENTE para ese contrato.
 * @param {number} idUsSeg – id_usuario_seguro
 * @returns Promise<{ pendiente: boolean }>
 */
export function hasPendingReembolso(idUsSeg) {
  return axios.get(`${API_BASE}/reembolsos/pendiente/${idUsSeg}`);
}
