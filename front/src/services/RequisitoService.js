// src/services/RequisitoService.js
import axios from 'axios';

// RequisitoService.js
export const getRequisitosPorSeguro = async (id_seguro) => {
  return await axios.get(`http://localhost:3030/requisito/por-seguro/${id_seguro}`);
};

