import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DatePicker, Table, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const JornadasReporte = () => {
  const [jornadas, setJornadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaInicio: null,
    fechaFin: null,
    empleadoId: null
  });

  const fetchJornadas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio.format('YYYY-MM-DD');
      if (filters.fechaFin) params.fechaFin = filters.fechaFin.format('YYYY-MM-DD');
      
      const response = await axios.get('/api/jornadas/reporte', { params });
      setJornadas(response.data);
    } catch (error) {
      console.error('Error fetching jornadas:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJornadas();
  }, [fetchJornadas]);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
    },
    {
      title: 'Empleado',
      dataIndex: ['empleado', 'nombre'],
      key: 'empleado',
    },
    {
      title: 'Finca',
      dataIndex: ['finca', 'nombre'],
      key: 'finca',
    },
    {
      title: 'Libras',
      dataIndex: 'libras_recolectadas',
      key: 'libras',
    },
    {
      title: 'Precio Libra',
      dataIndex: 'precio_libra',
      key: 'precio',
      render: value => `$${value.toFixed(2)}`
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `$${(record.libras_recolectadas * record.precio_libra).toFixed(2)}`
    }
  ];

  return (
    <div>
      <h2>Reporte de Jornadas</h2>
      
      <div style={{ marginBottom: 16 }}>
        <DatePicker
          placeholder="Fecha inicio"
          onChange={(date) => setFilters({...filters, fechaInicio: date})}
          style={{ marginRight: 8 }}
        />
        <DatePicker
          placeholder="Fecha fin"
          onChange={(date) => setFilters({...filters, fechaFin: date})}
          style={{ marginRight: 8 }}
        />
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={() => {
            // Lógica para exportar a Excel
          }}
        >
          Exportar
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={jornadas} 
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default JornadasReporte;