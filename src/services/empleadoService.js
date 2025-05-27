import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/empleados';

export const getEmpleados = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error obteniendo empleados:", error);
        return [];
    }
};

export const createEmpleado = async (empleado) => {
    try {
        const response = await axios.post(API_URL, empleado);
        return response.data;
    } catch (error) {
        console.error("Error creando empleado:", error);
        return { message: "Error al crear empleado" };
    }
};

export const updateEmpleado = async (id, empleado) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, empleado);
        return response.data;
    } catch (error) {
        console.error("Error actualizando empleado:", error);
        return { message: "Error al actualizar empleado" };
    }
};

export const deleteEmpleado = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error eliminando empleado:", error);
        return { message: "Error al eliminar empleado" };
    }
};
