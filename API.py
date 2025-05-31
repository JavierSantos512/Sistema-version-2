from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import os

app = Flask(__name__)

# Configuración CORS
CORS(app, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:  # Si hay un origen en la petición
        response.headers['Access-Control-Allow-Origin'] = origin
    else:  # Si no hay origen, permitir localhost:3000
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Request-With'
    response.headers['Access-Control-Expose-Headers'] = '*'
    
    if request.method == 'OPTIONS':
        response.headers['Access-Control-Max-Age'] = '1728000'
        response.headers['Content-Type'] = 'text/plain'
    
    return response

app.config['SECRET_KEY'] = os.urandom(24)

# Configuración de la base de datos
db_config = {
    'host': 'bglucmgbm4ndh8uojido-mysql.services.clever-cloud.com',
    'database': 'bglucmgbm4ndh8uojido',
    'user': 'u0mi0h3vk85jpjrk',
    'password': '2OMj4BJWJKwHLrC6HfEa',
    'port': '3306'
}

# Función para conectar a la base de datos
def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        return None

# Rutas de autenticación
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['username', 'password', 'email']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            
            # Verificar si el usuario ya existe
            cursor.execute("SELECT id FROM usuarios WHERE username = %s", (data['username'],))
            if cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"message": "El usuario ya existe"}), 400
            
            # Crear nuevo usuario
            hashed_password = generate_password_hash(data['password'])
            query = "INSERT INTO usuarios (username, password, email) VALUES (%s, %s, %s)"
            cursor.execute(query, (data['username'], hashed_password, data['email']))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Usuario registrado exitosamente"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al registrar usuario"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['username', 'password']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE username = %s", (data['username'],))
            user = cursor.fetchone()
            cursor.close()
            connection.close()
            
            if user and check_password_hash(user['password'], data['password']):
                token = jwt.encode({
                    'user_id': user['id'],
                    'exp': datetime.utcnow() + timedelta(days=1)
                }, app.config['SECRET_KEY'])
                return jsonify({
                    "token": token,
                    "user": {
                        "id": user['id'],
                        "username": user['username']
                    }
                })
            return jsonify({"message": "Credenciales inválidas"}), 401
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error en el login"}), 500

# Rutas de empleados
@app.route('/api/empleados', methods=['GET'])
def get_empleados():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM empleados")
            empleados = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(empleados)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify([])

@app.route('/api/empleados', methods=['POST'])
def create_empleado():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['nombre', 'cedula', 'telefono']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO empleados (nombre, cedula, telefono) VALUES (%s, %s, %s)"
            cursor.execute(query, (data['nombre'], data['cedula'], data['telefono']))
            connection.commit()
            new_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": new_id, "message": "Empleado creado exitosamente"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al crear empleado"}), 500

@app.route('/api/empleados/<int:id>', methods=['PUT'])
def update_empleado(id):
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['nombre', 'cedula', 'telefono']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "UPDATE empleados SET nombre = %s, cedula = %s, telefono = %s WHERE id = %s"
            cursor.execute(query, (data['nombre'], data['cedula'], data['telefono'], id))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Empleado actualizado exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al actualizar empleado"}), 500

@app.route('/api/empleados/<int:id>', methods=['DELETE'])
def delete_empleado(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "DELETE FROM empleados WHERE id = %s"
            cursor.execute(query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Empleado eliminado exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al eliminar empleado"}), 500

# Rutas de fincas
@app.route('/api/fincas', methods=['GET'])
def get_fincas():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM fincas")
            fincas = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(fincas)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify([])

@app.route('/api/fincas', methods=['POST'])
def create_finca():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['nombre', 'ubicacion']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO fincas (nombre, ubicacion) VALUES (%s, %s)"
            cursor.execute(query, (data['nombre'], data['ubicacion']))
            connection.commit()
            new_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({"id": new_id, "message": "Finca creada exitosamente"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al crear finca"}), 500

@app.route('/api/fincas/<int:id>', methods=['PUT'])
def update_finca(id):
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['nombre', 'ubicacion']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "UPDATE fincas SET nombre = %s, ubicacion = %s WHERE id = %s"
            cursor.execute(query, (data['nombre'], data['ubicacion'], id))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Finca actualizada exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al actualizar finca"}), 500

@app.route('/api/fincas/<int:id>', methods=['DELETE'])
def delete_finca(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "DELETE FROM fincas WHERE id = %s"
            cursor.execute(query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Finca eliminada exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al eliminar finca"}), 500

@app.route('/api/asignaciones', methods=['GET'])
def get_asignaciones():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    a.*,
                    e.nombre as empleado_nombre,
                    e.cedula as empleado_dpi,
                    e.telefono as empleado_telefono,
                    f.nombre as finca_nombre,
                    f.ubicacion as finca_ubicacion
                FROM asignaciones a 
                LEFT JOIN empleados e ON a.empleado_id = e.id 
                LEFT JOIN fincas f ON a.finca_id = f.id
            """)
            asignaciones = cursor.fetchall()
            cursor.close()
            connection.close()
            
            formatted_asignaciones = []
            for asignacion in asignaciones:
                formatted_asignacion = {
                    "id": asignacion["id"],
                    "fecha_asignacion": asignacion["fecha_asignacion"],
                    "descripcion": asignacion.get("descripcion", ""),  # Nuevo campo
                    "empleado": {
                        "id": asignacion["empleado_id"],
                        "nombre": asignacion["empleado_nombre"],
                        "dpi": asignacion["empleado_dpi"],
                        "telefono": asignacion["empleado_telefono"]
                    },
                    "finca": {
                        "id": asignacion["finca_id"],
                        "nombre": asignacion["finca_nombre"],
                        "ubicacion": asignacion["finca_ubicacion"]
                    }
                }
                formatted_asignaciones.append(formatted_asignacion)
            
            return jsonify(formatted_asignaciones)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify([])

@app.route('/api/asignaciones', methods=['POST'])
def create_asignacion():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['empleado_id', 'finca_id']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = """
                INSERT INTO asignaciones 
                (empleado_id, finca_id, fecha_asignacion, descripcion) 
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query, (
                data['empleado_id'], 
                data['finca_id'],
                data.get('fecha_asignacion', datetime.now().strftime('%Y-%m-%d')),
                data.get('descripcion', '')  # Nuevo campo
            ))
            connection.commit()
            new_id = cursor.lastrowid
            cursor.close()
            connection.close()
            return jsonify({
                "id": new_id, 
                "message": "Asignación creada exitosamente",
                "descripcion": data.get('descripcion', '')
            }), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al crear asignación"}), 500

@app.route('/api/asignaciones/<int:id>', methods=['PUT'])
def update_asignacion(id):
    try:
        data = request.get_json()
        print("Datos recibidos:", data)  # Debug
        
        if not data or not all(k in data for k in ['empleado_id', 'finca_id', 'fecha_asignacion']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        empleado_id = int(data['empleado_id'])
        finca_id = int(data['finca_id'])
        fecha_asignacion = data['fecha_asignacion']
        descripcion = data.get('descripcion', '')  # Nuevo campo
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            
            # Verificar si la asignación existe
            cursor.execute("SELECT id FROM asignaciones WHERE id = %s", (id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"message": "Asignación no encontrada"}), 404
            
            # Verificar empleado y finca (código existente)
            
            # Actualizar la asignación con el nuevo campo
            query = """
                UPDATE asignaciones 
                SET empleado_id = %s, 
                    finca_id = %s, 
                    fecha_asignacion = %s,
                    descripcion = %s 
                WHERE id = %s
            """
            cursor.execute(query, (
                empleado_id, 
                finca_id, 
                fecha_asignacion,
                descripcion,  # Nuevo campo
                id
            ))
            connection.commit()
            
            if cursor.rowcount > 0:
                cursor.close()
                connection.close()
                return jsonify({
                    "message": "Asignación actualizada exitosamente",
                    "id": id,
                    "empleado_id": empleado_id,
                    "finca_id": finca_id,
                    "fecha_asignacion": fecha_asignacion,
                    "descripcion": descripcion  # Nuevo campo
                }), 200
            else:
                cursor.close()
                connection.close()
                return jsonify({"message": "No se pudo actualizar la asignación"}), 500
    except ValueError as e:
        print("Error de conversión:", str(e))
        return jsonify({"error": "Error en el formato de los datos"}), 400
    except Error as e:
        print("Error MySQL:", str(e))
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print("Error general:", str(e))
        return jsonify({"error": "Error interno del servidor"}), 500

# Rutas de pagos
@app.route('/api/pagos', methods=['GET'])
def get_pagos():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Consulta corregida (nombres de columnas exactos)
            cursor.execute("""
                SELECT
                    p.id,
                    p.fecha_pago,
                    p.libras_totales AS libras,
                    p.precio_libra_promedio AS precio_libra,
                    p.total,
                    e.id AS empleado_id,
                    e.nombre AS empleado_nombre,
                    e.cedula AS empleado_dpi,
                    e.telefono AS empleado_telefono
                FROM pagos p
                LEFT JOIN empleados e ON p.empleados_id = e.id
                ORDER BY p.fecha_pago DESC
            """)

            pagos = cursor.fetchall()
            cursor.close()
            connection.close()

            formatted_pagos = []
            for pago in pagos:
                try:
                    formatted_pagos.append({
                        "id": pago["id"],
                        "fecha_pago": pago["fecha_pago"].strftime("%Y-%m-%d") if pago["fecha_pago"] else None,
                        "libras": float(pago["libras"]) if pago["libras"] else 0.0,
                        "precio_libra": float(pago["precio_libra"]) if pago["precio_libra"] else 0.0,
                        "total": float(pago["total"]) if pago["total"] else 0.0,
                        "empleado": {
                            "id": pago["empleado_id"],
                            "nombre": pago["empleado_nombre"] or "Sin empleado",
                            "dpi": pago["empleado_dpi"] or "",
                            "telefono": pago["empleado_telefono"] or ""
                        }
                    })
                except Exception as e:
                    print(f"Error formateando pago {pago['id']}: {str(e)}")
                    continue

            return jsonify(formatted_pagos), 200

    except Exception as e:
        print(f"Error en get_pagos: {str(e)}")
        return jsonify({"error": "Error al obtener los pagos", "detalle": str(e)}), 500


@app.route('/api/pagos', methods=['POST'])
def create_pago():
    try:
        data = request.get_json()
        
        # Validación de campos requeridos
        if not data or not all(k in data for k in ['empleado_id', 'libras', 'precio_libra']):
            return jsonify({"error": "Datos incompletos", 
                          "campos_requeridos": ["empleado_id", "libras", "precio_libra"]}), 400
        
        # Validación de tipos de datos
        try:
            libras = float(data['libras'])
            precio_libra = float(data['precio_libra'])
            empleado_id = int(data['empleado_id'])
        except ValueError as e:
            return jsonify({"error": "Datos inválidos", "detalle": str(e)}), 400
        
        total = libras * precio_libra
        fecha_pago = datetime.now().strftime("%Y-%m-%d")  # Fecha actual por defecto
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            
            # Query corregida (incluye fecha_pago y nombres de columnas exactos)
            query = """
                INSERT INTO pagos 
                    (empleados_id, libras_totales, precio_libra_promedio, total, fecha_pago) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                empleado_id,
                libras,
                precio_libra,
                total,
                fecha_pago
            ))
            
            connection.commit()
            new_id = cursor.lastrowid
            
            # Obtener el pago recién creado para devolverlo
            cursor.execute("""
                SELECT p.*, e.nombre as empleado_nombre, e.cedula as empleado_dpi
                FROM pagos p
                LEFT JOIN empleados e ON p.empleados_id = e.id
                WHERE p.id = %s
            """, (new_id,))
            
            pago_creado = cursor.fetchone()
            cursor.close()
            connection.close()
            
            if not pago_creado:
                return jsonify({"error": "No se pudo recuperar el pago creado"}), 500
                
            return jsonify({
                "id": pago_creado["id"],
                "fecha_pago": pago_creado["fecha_pago"].strftime("%Y-%m-%d") if pago_creado["fecha_pago"] else None,
                "libras": float(pago_creado["libras_totales"]),
                "precio_libra": float(pago_creado["precio_libra_promedio"]),
                "total": float(pago_creado["total"]),
                "empleado": {
                    "id": pago_creado["empleados_id"],
                    "nombre": pago_creado["empleado_nombre"],
                    "dpi": pago_creado["empleado_dpi"]
                },
                "message": "Pago creado exitosamente"
            }), 201
            
    except Exception as e:
        print(f"Error en create_pago: {str(e)}")
        return jsonify({
            "error": "Error al crear el pago",
            "detalle": str(e)
        }), 500

@app.route('/api/pagos/<int:id>', methods=['PUT'])
def update_pago(id):
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['empleado_id', 'libras', 'precio_libra']):
            return jsonify({"message": "Datos incompletos"}), 400
        
        total = float(data['libras']) * float(data['precio_libra'])
        
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "UPDATE pagos SET empleado_id = %s, libras = %s, precio_libra = %s, total = %s WHERE id = %s"
            cursor.execute(query, (data['empleado_id'], data['libras'], data['precio_libra'], total, id))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Pago actualizado exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al actualizar pago"}), 500

@app.route('/api/pagos/<int:id>', methods=['DELETE'])
def delete_pago(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = "DELETE FROM pagos WHERE id = %s"
            cursor.execute(query, (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Pago eliminado exitosamente"}), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"message": "Error al eliminar pago"}), 500

# Jornadas
@app.route('/api/jornadas', methods=['GET'])
def get_jornadas():
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT 
                    j.id, j.fecha, j.libras_recolectadas, j.precio_libra,
                    e.id as empleados_id, 
                    COALESCE(e.nombre, 'Sin empleado') as empleados_nombre,
                    COALESCE(e.cedula, '') as empleados_cedula,
                    COALESCE(e.telefono, '') as empleados_telefono,
                    f.id as fincas_id, 
                    COALESCE(f.nombre, 'Sin finca') as fincas_nombre
                FROM jornadas j
                LEFT JOIN empleados e ON j.empleados_id = e.id
                LEFT JOIN fincas f ON j.fincas_id = f.id
            """)

            jornadas = cursor.fetchall()
            cursor.close()
            connection.close()

            formatted_jornadas = []
            for jornada in jornadas:
                formatted_jornadas.append({
                    "id": jornada["id"],
                    "fecha": jornada["fecha"],
                    "libras_recolectadas": float(jornada["libras_recolectadas"]) if jornada["libras_recolectadas"] else 0.0,
                    "precio_libra": float(jornada["precio_libra"]) if jornada["precio_libra"] else 0.0,
                    "empleado": {
                        "id": jornada["empleados_id"],
                        "nombre": jornada["empleados_nombre"],
                        "dpi": jornada["empleados_cedula"],
                        "telefono": jornada["empleados_telefono"]
                    },
                    "finca": {
                        "id": jornada["fincas_id"],
                        "nombre": jornada["fincas_nombre"]
                    }
                })

            return jsonify(formatted_jornadas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jornadas', methods=['POST'])
def create_jornada():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['empleados_id', 'fincas_id', 'fecha', 'libras_recolectadas', 'precio_libra']):
            return jsonify({"error": "Datos incompletos"}), 400

        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            query = """
            INSERT INTO jornadas (empleados_id, fincas_id, fecha, libras_recolectadas, precio_libra)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (
                data['empleados_id'],
                data['fincas_id'],
                data['fecha'],
                data['libras_recolectadas'],
                data['precio_libra']
            ))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Jornada creada exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jornadas/<int:id>', methods=['PUT'])
def update_jornada(id):
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['empleados_id', 'fincas_id', 'fecha', 'libras_recolectadas', 'precio_libra']):
            return jsonify({"error": "Datos incompletos"}), 400

        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM jornadas WHERE id = %s", (id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Jornada no encontrada"}), 404

            query = """
            UPDATE jornadas 
            SET empleados_id = %s, fincas_id = %s, fecha = %s, libras_recolectadas = %s, precio_libra = %s
            WHERE id = %s
            """
            cursor.execute(query, (
                data['empleados_id'],
                data['fincas_id'],
                data['fecha'],
                data['libras_recolectadas'],
                data['precio_libra'],
                id
            ))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Jornada actualizada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jornadas/<int:id>', methods=['DELETE'])
def delete_jornada(id):
    try:
        connection = get_db_connection()
        if connection and connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM jornadas WHERE id = %s", (id,))
            if not cursor.fetchone():
                cursor.close()
                connection.close()
                return jsonify({"error": "Jornada no encontrada"}), 404

            cursor.execute("DELETE FROM jornadas WHERE id = %s", (id,))
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Jornada eliminada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
    