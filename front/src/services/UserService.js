import axios from 'axios';

const API = 'http://localhost:3030/usuario';

export const getUsuarios = () => axios.get(API);
export const crearUsuario = (data) => axios.post(API, data);
export const editarUsuario = (id, data) => axios.put(`${API}/${id}`, data);
export const desactivarUsuario = (id) => axios.patch(`${API}/${id}/desactivar`);
export const getUsuariosInactivos = () => axios.get(`${API}/inactivos`);
export const activarUsuario = (id) => axios.patch(`${API}/${id}/activar`);
export const contarClientes = () => axios.get('http://localhost:3030/usuario/conteo/clientes');
export const obtenerUsuarioPorId = (id) => axios.get(`http://localhost:3030/usuario/${id}`);

// NUEVA FUNCIÓN PARA VALIDAR CÉDULA Y TIPO
export const buscarUsuarioPorCedulaTipo = (cedula, tipo) =>
  axios.get(`${API}/buscar?cedula=${cedula}&tipo=${tipo}`);

