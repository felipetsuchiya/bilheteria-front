import axios from 'axios';

// Cria uma instância customizada do Axios
export const api = axios.create({
  // Coloque aqui a URL base do seu backend NestJS
  baseURL: 'http://localhost:8000', 
  timeout: 10000, // Tempo máximo de espera da requisição (10 segundos)
});