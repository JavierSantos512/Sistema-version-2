import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4E342E' },
  table: { display: "table", width: "auto", borderWidth: 1 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "25%", borderWidth: 1, backgroundColor: '#4E342E' },
  tableCol: { width: "25%", borderWidth: 1 },
  tableCellHeader: { margin: 5, fontSize: 12, fontWeight: 'bold', color: 'white' },
  tableCell: { margin: 5, fontSize: 10 },
  footer: { textAlign: 'center', fontSize: 10, color: '#666', position: 'absolute', bottom: 30 },
});

const PagosPDF = ({ pagos }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Reporte de Pagos</Text>
        <Text>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Empleado</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Libras</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Precio Libra</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total</Text></View>
        </View>

        {pagos.map((pago) => (
          <View style={styles.tableRow} key={pago.id}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.empleado.nombre}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.libras}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.precio_libra}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.total}</Text></View>
          </View>
        ))}
      </View>

      <View style={styles.footer}><Text>Página {({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`}</Text></View>
    </Page>
  </Document>
);

export default PagosPDF;
