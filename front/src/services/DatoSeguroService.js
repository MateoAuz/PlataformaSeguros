import axios from 'axios';
import { BaseUrl } from '../shared/conexion';

const COBERTURA_API = `${BaseUrl.BASE_URL}/cobertura`;
const BENEFICIO_API = `${BaseUrl.BASE_URL}/beneficio`;
const REQUISITO_API = `${BaseUrl.BASE_URL}/requisito`;

export const getCoberturas = () => axios.get(COBERTURA_API);
export const getBeneficios = () => axios.get(BENEFICIO_API);
export const getRequisitos = () => axios.get(REQUISITO_API);
export const crearBeneficio = (data) => axios.post(`${BaseUrl.BASE_URL}/beneficio`, data);
export const crearRequisito = (data) => axios.post(REQUISITO_API, data);
