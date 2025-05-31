import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/pagos';

const PagoService = {
  /**
   * Obtiene pagos por rango de fechas
   * @param {Object} dateRange - Objeto con {start, end} (objetos Date)
   * @returns {Promise<Array>} Lista de pagos
   */
  getPagosByDateRange: async (dateRange) => {
    try {
      // Formatear fechas a YYYY-MM-DD
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      const params = {
        inicio: formatDate(dateRange.start),
        fin: formatDate(dateRange.end)
      };

      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo pagos por fecha:", error);
      throw error; // Re-lanzamos el error para manejarlo en el componente
    }
  },

  /**
   * Obtiene pagos por período (día, semana, mes)
   * @param {string} periodo - 'dia', 'semana' o 'mes'
   * @param {Date} fechaReferencia - Fecha de referencia
   * @returns {Promise<Array>} Lista de pagos
   */
  getPagosPorPeriodo: async (periodo, fechaReferencia) => {
    try {
      // Validar período
      if (!['dia', 'semana', 'mes'].includes(periodo)) {
        throw new Error('Período no válido. Usa "dia", "semana" o "mes".');
      }

      const response = await axios.get(`${API_URL}/por-periodo`, {
        params: {
          periodo,
          fecha: fechaReferencia.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error obteniendo pagos por período:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los pagos
   * @returns {Promise<Array>} Lista completa de pagos
   */
  getAllPagos: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo todos los pagos:", error);
      throw error;
    }
  }
};

export default PagoService;