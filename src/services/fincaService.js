import axios from 'axios';

// Configuración directa sin archivo api.js separado
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

const FincaService = {
  /**
   * Obtiene todas las fincas sin filtros
   * @returns {Promise<Array>} Lista completa de fincas
   */
  getAllFincas: async () => {
    try {
      const response = await api.get('/fincas');
      return response.data;
    } catch (error) {
      console.error("Error obteniendo fincas:", error);
      throw error;
    }
  }
};

export default FincaService;