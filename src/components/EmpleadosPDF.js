import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#4E342E',
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
});

const EmpleadosPDF = ({ empleados }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Sistema de Gestión de Café</Text>
        <Text>Listado de Empleados</Text>
        <Text>Fecha: {new Date().toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>ID</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Nombre</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Puesto</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Teléfono</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Fecha Ingreso</Text>
          </View>
        </View>
        
        {empleados.map((empleado) => (
          <View style={styles.tableRow} key={empleado.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{empleado.id}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{empleado.nombre}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{empleado.puesto}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{empleado.telefono}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{empleado.fecha_ingreso}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default EmpleadosPDF;