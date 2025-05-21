import axios from 'axios';

const API = 'http://localhost:3030/seguros';

export const getSeguros = () => axios.get(API);
