const pagos = [
  { id: 1, empleadoId: 1, monto: 2500, fecha: "2025-05-01" },
  { id: 2, empleadoId: 2, monto: 1800, fecha: "2025-05-15" }
];

// Función para obtener todos los pagos
export const getPagos = () => pagos;

// Función para obtener pagos en un rango de fechas
export const getPagosByDateRange = (fechaInicio, fechaFin) => {
  return pagos.filter(pago => pago.fecha >= fechaInicio && pago.fecha <= fechaFin);
};
