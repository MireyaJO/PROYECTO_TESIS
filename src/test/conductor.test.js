import request from 'supertest'; // Supertest para realizar peticiones HTTP
import mongoose from 'mongoose'; // Mongoose para gestionar la conexión de la base de datos
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Configuración inicial para la base de datos en memoria
let mongoServer;

beforeAll(async () => {
    // Conexión a la base de datos real
    if (!process.env.MONGODB_URI_PRODUCTION) {
      throw new Error('La variable de entorno MONGO_URI no está configurada.');
    }
    await mongoose.connect(process.env.MONGODB_URI_PRODUCTION, { useNewUrlParser: true, useUnifiedTopology: true });
  });
  
  afterAll(async () => {
    // Cerrar la conexión a la base de datos
    await mongoose.disconnect();
});

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ // 

describe('Pruebas de rutas del conductor', () => {
    const app = "https://proyecto-tesis-1.onrender.com";
    // Prueba: Inicio de sesión del administrador
    test('Debe iniciar sesión correctamente con credenciales válidas para un conductor', async () => {
        // Credenciales válidas del conductor
        const email = 'mireya.garcia@epn.edu.ec';
        const password = '16d2781a9f448ab9';
        const role = "conductor"
    
        const response = await request(app)
            .post('/api/login') // Endpoint de inicio de sesión
            .send({
                email,
                password,
                role
            });
    
        console.log(response.body); // Imprime la respuesta para verificar errores
    
        // Verifica que el código de estado sea 200
        expect(response.statusCode).toBe(200);
    
        // Verifica que el token se devuelva correctamente
        expect(response.body).toHaveProperty('token');
    
        // Verifica el mensaje de respuesta
        expect(response.body.msg_login_conductor).toBe('Bienvenido conductor');
    });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ // 

    // Prueba: Registro de un conductor
    test('Debe registrar un nuevo estudiante', async () => {
        const token = ''; // Token válido para pruebas
    
        const response = await request(app)
            .post('/api/registro/estudiantes')
            .set('Authorization', `Bearer ${token}`) // Enviar el token de autenticación
            .field('nombre', 'Juan')
            .field('apellido', 'Pérez')
            .field('nivelEscolar', 'Primero de básica')
            .field('genero', 'Masculino')
            .field('paralelo', 'A')
            .field('cedula', '1234567890')
            .field('ubicacionDomicilio', 'https://maps.app.goo.gl/S5denJ9bXtMxAsPi8')
            .field('recoCompletoOMedio', 'Completo')

    
        console.log(response.body); // Imprime la respuesta del servidor para verificar posibles errores
    
        // Verifica que el estudiante fue creado exitosamente
        expect(response.status).toBe(201);
        expect(response.body.msg_registro_estudiantes).toBe('Estudiante registrado exitosamente');
    });
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ // 

    // Actualizar contraseña desde que el logeo del conductor
    test('Debe actualizar la contraseña del conductor logueado', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .patch('/api/actualizar/contrasenia/conductor')
            .set('Authorization', `Bearer ${token}`)
            .send({
                passwordAnterior: 'contraseña_anterior',
                passwordActual: 'nueva_contraseña',
                passwordActualConfirm: 'nueva_contraseña'
            });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(201);
        expect(response.body.msg_actualizacion_contrasenia).toBe(
            'La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse'
        );
    });
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ // 
    // Lista de los estudiantes del conductor 
    test('Debe listar los estudiantes de la ruta del conductor logueado', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .get('/api/lista/estudiantes')
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('msg_lista_estudiantes');
        expect(response.body.estudiantes).toBeInstanceOf(Array); // Asegura que sea un array
    });
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ // 
    // Busqueda de un estudiante por cedula  
    test('Debe buscar un estudiante por su cédula', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const cedula = '1234567890'; // Reemplaza con una cédula válida para pruebas
    
        const response = await request(app)
            .get(`/api/buscar/estudiante/cedula/${cedula}`)
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('msg');
        expect(response.body.estudiante).toHaveProperty('cedula', cedula);
    });
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // Prueba de actualizar los datos del estudiante 
    test('Debe actualizar los datos de un estudiante', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const idEstudiante = 'id_estudiante'; // Reemplaza con un ID válido de estudiante
    
        const response = await request(app)
            .patch(`/api/actualizar/estudiante/${idEstudiante}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Nuevo Nombre',
                apellido: 'Nuevo Apellido',
                nivelEscolar: 'Primero de básica',
                genero: 'Masculino',
                paralelo: 'A',
                cedula: '1234567890',
                ubicacionDomicilio: 'Dirección actualizada',
                recoCompletoOMedio: 'Completo'
            });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_actualizar_estudiantes).toBe(
            'Los datos del estudiante Nuevo Nombre Nuevo Apellido han sido actualizados exitosamente'
        );
    });
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    
    // Eliminar a un estudiante 
    test('Debe eliminar un estudiante', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const idEstudiante = 'id_estudiante'; // Reemplaza con un ID válido de estudiante
    
        const response = await request(app)
            .delete(`/api/eliminar/estudiante/${idEstudiante}`)
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_eliminar_estudiante).toBe('Estudiante eliminado exitosamente');
    });
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // Actualizacion de la ubicacion de un conductor 
    test('Debe actualizar la ubicación del conductor', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .post('/api/actualizar/ubicacion')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ubicacionDomicilio: 'Nueva ubicación del conductor',
                latitud: 0.0000,
                longitud: 0.0000
            });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_actualizacion_ubicacion).toBe('Ubicación actualizada correctamente');
    });

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // Vizualizacion del perfil del conductor
    
    test('Debe visualizar el perfil del conductor', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .get('/api/perfil/conductor')
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('nombre');
        expect(response.body).toHaveProperty('apellido');
    });
    
    
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // Prueba para actualizar el perfil del conductor 
    test('Debe actualizar el perfil del conductor', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .patch('/api/actualizar/perfil/conductor')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Nuevo Nombre Conductor',
                apellido: 'Nuevo Apellido Conductor',
                telefono: '0998765432',
                email: 'nuevoemail@correo.com'
            });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_actualizar_perfil).toBe('Perfil actualizado exitosamente');
    });
    
    
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // REgistro de la asistencia trde 
    test('Debe registrar asistencia tarde', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
    
        const response = await request(app)
            .post('/api/tomar/asistencia/tarde')
            .set('Authorization', `Bearer ${token}`)
            .send({
                cedulaEstudiante: '1234567890',
                fecha: '2025-01-18'
            });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_asistencia_tarde).toBe('Asistencia tarde registrada correctamente');
    });
    
    
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    
    // Prueba de busqueda de asistencia por fecha 
    test('Debe buscar la asistencia por fecha', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const fecha = '2025-01-18'; // Fecha de prueba
    
        const response = await request(app)
            .get(`/api/buscar/asistencia/fecha/${fecha}`)
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('asistencia');
    });
    
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    
    // Peuba para actualizar la lista de asistencia 
    test('Debe actualizar la lista de asistencia', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const listaId = 'id_lista_asistencia'; // Reemplaza con un ID válido de lista
        const estudiantes = [
            { estudiante: 'id_estudiante_1', asistio: true },
            { estudiante: 'id_estudiante_2', asistio: false }
        ]; // Datos de estudiantes para la prueba
    
        const response = await request(app)
            .patch(`/api/actualizar/asistencia/${listaId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ estudiantes });
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg_actualizar_lista).toBe(
            `La lista de la mañana con ID: ${listaId} se ha actualizado exitosamente`
        );
        expect(response.body.notificaciones.length).toBeGreaterThan(0); // Verifica que se hayan enviado notificaciones
    });
    
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    
    // Prueba para eliminar de la lista de asistencia 
    test('Debe eliminar una lista de asistencia', async () => {
        const token = 'token_de_prueba_valido'; // Reemplaza con un token válido para pruebas
        const listaId = 'id_lista_asistencia'; // Reemplaza con un ID válido de lista
    
        const response = await request(app)
            .delete(`/api/eliminar/asistencia/id/${listaId}`)
            .set('Authorization', `Bearer ${token}`);
    
        console.log(response.body); // Para depuración
    
        // Verifica que la respuesta sea exitosa
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe(
            `La lista de la mañana con ID: ${listaId}, se ha eliminado exitosamente`
        );
    });
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//
});