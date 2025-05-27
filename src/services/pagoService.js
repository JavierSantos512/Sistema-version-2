import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/pagos';

const pagoService = {
    getPagosPorPeriodo: async (periodo, fechaReferencia) => {
        try {
            let fechaInicio, fechaFin;

            // Calcula el rango según el período seleccionado
            switch (periodo) {
                case 'dia':
                    fechaInicio = fechaReferencia.toISOString().split('T')[0]; // Formato YYYY-MM-DD
                    fechaFin = fechaInicio;
                    break;
                case 'semana':
                    const diaSemana = fechaReferencia.getDay(); // 0 (domingo) - 6 (sábado)
                    fechaInicio = new Date(fechaReferencia);
                    fechaInicio.setDate(fechaReferencia.getDate() - diaSemana); // Inicio de semana (domingo)
                    fechaFin = new Date(fechaInicio);
                    fechaFin.setDate(fechaInicio.getDate() + 6); // Fin de semana (sábado)
                    fechaInicio = fechaInicio.toISOString().split('T')[0];
                    fechaFin = fechaFin.toISOString().split('T')[0];
                    break;
                case 'mes':
                    const primerDiaMes = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
                    const ultimoDiaMes = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 1, 0);
                    fechaInicio = primerDiaMes.toISOString().split('T')[0];
                    fechaFin = ultimoDiaMes.toISOString().split('T')[0];
                    break;
                default:
                    throw new Error('Período no válido. Usa "dia", "semana" o "mes".');
            }

            const response = await axios.get(`${API_URL}?periodo=${periodo}&inicio=${fechaInicio}&fin=${fechaFin}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo pagos:", error);
            return [];
        }
    }
};

export default pagoService;