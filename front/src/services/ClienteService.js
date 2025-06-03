// src/services/ClienteService.js
import axios from 'axios';

const API_URL = 'http://localhost:3030/usuario';



export const crearCliente = async (cliente) => {
  return await axios.post(`${API_URL}/`, cliente);
};

export const editarCliente = async (id, cliente) => {
  return await axios.put(`${API_URL}/${id}`, cliente);
};

export const desactivarCliente = async (id) => {
  return await axios.patch(`${API_URL}/${id}/desactivar`);
};

export const getSolicitudesClientes = async () => {
  return await axios.get(`${API_URL}/solicitudes`);
};

export const activarCliente = async (id) => {
  return await axios.put(`${API_URL}/${id}/activar-cliente`);
};
export const getClientes = async () => {
  return await axios.get('http://localhost:3030/usuario/clientes');
};

