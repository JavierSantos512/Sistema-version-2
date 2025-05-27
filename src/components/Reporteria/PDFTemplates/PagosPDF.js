import { Document, Page, Text, View } from "@react-pdf/renderer";

const PagosPDF = ({ pagos }) => (
  <Document>
    <Page>
      <View>
        <Text>Reporte de Pagos</Text>
        {pagos.map((pago) => (
          <Text key={pago.id}>
            Empleado ID: {pago.empleadoId}, Monto: {pago.monto}
          </Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default PagosPDF;
