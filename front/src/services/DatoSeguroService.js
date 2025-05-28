import axios from 'axios';

const COBERTURA_API = 'http://localhost:3030/cobertura';
const BENEFICIO_API = 'http://localhost:3030/beneficio';
const REQUISITO_API = 'http://localhost:3030/requisito';

export const getCoberturas = () => axios.get(COBERTURA_API);
export const getBeneficios = () => axios.get(BENEFICIO_API);
export const getRequisitos = () => axios.get(REQUISITO_API);
export const crearBeneficio = (data) => axios.post('http://localhost:3030/beneficio', data);
export const crearRequisito = (data) => axios.post(REQUISITO_API, data);
