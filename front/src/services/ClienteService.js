import axios from 'axios';
import { BaseUrl } from '../shared/conexion';

const URL = `${BaseUrl.BASE_URL}/cliente`;
export const getClientes = () => axios.get(`${URL}/clientes`);



export const crearCliente = (data) => axios.post(URL, { ...data, tipo: 2 });
export const editarCliente = (id, data) => axios.put(URL + '/' + id, { ...data, tipo: 2 });
export const desactivarCliente = (id) => {
  return axios.put(`${URL}/${id}/desactivar`);
};
export const activarCliente = (id) => axios.patch(URL + '/' + id + '/activar');
export const crearClientePendiente = (data) =>
  axios.post(`${URL}/pendiente`, { ...data });

