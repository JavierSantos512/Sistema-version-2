import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '1 solid #6D4C41',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    backgroundColor: '#6D4C41',
    padding: 5,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    width: "25%",
    padding: 5,
    borderStyle: "solid",
    borderWidth: 1,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

const FincasPDF = ({ fincas }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Listado Completo de Fincas</Text>
        <Text style={styles.subtitle}>Total de fincas registradas: {fincas.length}</Text>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text>ID</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text>Nombre</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text>Ubicación</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text>Hectáreas</Text>
          </View>
        </View>
        
        {fincas.map((finca) => (
          <View style={styles.tableRow} key={finca.id}>
            <View style={styles.tableCol}>
              <Text>{finca.id}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>{finca.nombre || 'N/A'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>{finca.ubicacion || 'N/A'}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text>{finca.hectareas?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.footer} fixed>
        <Text>Generado el: {new Date().toLocaleDateString()}</Text>
      </View>
    </Page>
  </Document>
);

export default FincasPDF;