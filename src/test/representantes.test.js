import request from 'supertest'; // Supertest para realizar peticiones HTTP
import mongoose from 'mongoose'; // Mongoose para gestionar la conexión de la base de datos
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Configuración inicial para la base de datos - Verificación de la conexión de las pruebas con la base de datos
beforeAll(async () => {
    if (!process.env.MONGODB_URI_PRODUCTION) {
        throw new Error('La variable de entorno MONGODB_URI_PRODUCTION no está configurada.');
    }
    await mongoose.connect(process.env.MONGODB_URI_PRODUCTION, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------------------------------------------------- //

// Grupo de pruebas para el rol de Representante

describe('Pruebas de las rutas de todos los Roles', () => {
    const app = "https://proyecto-tesis-1.onrender.com";
    // Tooken del Representante
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWVlODJmZjk0YzU5NGYzM2U1NDRjOSIsImVtYWlsIjoiZnJqb2FjMjMwM0BnbWFpbC5jb20iLCJyb2xlIjoicmVwcmVzZW50YW50ZSIsImlhdCI6MTczODQ2NzQwMywiZXhwIjoxNzM4NDcxMDAzfQ.SYkKJ0jOH-LWLSfkgzatwwA_BpXDYq0L5AuKMkAOT7c'
    // Prueba de login del representante
    test('Debe iniciar sesión correctamente en el rol Representante', async () => {
            // Credenciales válidas del conductor
            const email = 'frjoac2303@gmail.com';
            const password = 'Pa123$$$';
            const role = "representante"
        
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
            expect(response.body.msg_login_representante).toBe('Bienvenido representante');
    });

    // Prueba de registro de un representante
    test('Debe registrar un representante correctamente', async () => {
        // Ruta del archivo de imagen local
            const filePath = path.join(__dirname, 'files', 'hm3.jpg');
        
            // Verificar si el archivo existe antes de ejecutar la prueba
            if (!fs.existsSync(filePath)) {
              throw new Error(`El archivo ${filePath} no existe. Asegúrate de que esté en la ubicación correcta.`);
            }

        const response = await request(app)
            .post('/api/registro/representantes')
            .field('nombre', 'Pablo')
            .field('apellido', 'Martinez')
            .field('telefono', '0983736288')
            .field('cedula', '1754107371')
            .field('genero', 'Masculino')
            .field('email', 'frjoac2303@gmail.com')
            .field('institucion', 'Unidad Educativa Particular Emaús')
            .field('password', 'Pa123$$$')
            .field('cedulaRepresentado', '1234567890')
            .attach('fotografia', filePath); // Archivo local
        
        console.log(response.body)
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('msg_registro_representante', 'Representante registrado exitosamente');
    });

    // ----------------------------------------------------------------------------------------------- //
    // Prueba de confirmacion del correo electronico ingresado
    test('Debe confirmar el correo del representante correctamente', async () => {
        const tokenEmail = '6vey7yjfacc'; // Este token debe ser generado previamente
    
        const response = await request(app)
            .get(`/api/confirmar/correoRepresentante/${tokenEmail}`);
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('msg', 'Cuenta confirmada exitosamente');
    });
    // ----------------------------------------------------------------------------------------------- //
    // Prueba de actualizacion de contraseña
    test('Debe actualizar la contraseña del representante correctamente', async () => {
        const passwordData = {
            passwordAnterior: 'Pa123$$$',
            passwordActual: 'Pa123###',
            passwordActualConfirm: 'Pa123###'
        };
    
        const response = await request(app)
            .patch('/api/actualizar/contrasenia/representante')
            .set('Authorization', `Bearer ${token}`) // token debe ser generado previamente
            .send(passwordData);
    
        console.log(response.body)
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('msg_actualizacion_contrasenia', 'La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse');
    });
    
    // ----------------------------------------------------------------------------------------------- //
    test('Debe listar los estudiantes representados correctamente', async () => {
        // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWU2YWU4NWZhOGI1ZDE5YjQ1ZjU2NiIsImVtYWlsIjoiZnJqb2FjMjMwM0BnbWFpbC5jb20iLCJyb2xlIjoicmVwcmVzZW50YW50ZSIsImlhdCI6MTczODQ0ODcyMCwiZXhwIjoxNzM4NDUyMzIwfQ.V3y212c83GvUoy3-4DZao4fYtFdwGWJp2MW7NFDRU3Q'
        const response = await request(app)
            .get('/api/listar/representados')
            .set('Authorization', `Bearer ${token}`); // token debe ser generado previamente
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('estudiantesRepresentados');
    });
    // ----------------------------------------------------------------------------------------------- //
    // Prueba de visualizar el perfil del representante
    test('Debe visualizar el perfil del representante correctamente', async () => {
        const response = await request(app)
            .get('/api/perfil/representante')
            .set('Authorization', `Bearer ${token}`); // token debe ser generado previamente
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('nombre');
        expect(response.body).toHaveProperty('apellido');
    });
    
    // Prueba de eliminar la cuenta del representante
    // Prueba de eliminar la cuenta del representante
    test('Debe eliminar la cuenta del representante correctamente', async () => {
        const response = await request(app)
            .delete('/api/eliminar/cuenta/representante')
            .set('Authorization', `Bearer ${token}`); // token debe ser generado previamente
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('msg', 'Cuenta eliminada satisfactoriamente');
    });
    
    // ----------------------------------------------------------------------------------------------- //
    // Prueba de alerta de llegada del conductor
    test('Debe recibir la alerta de llegada del conductor correctamente', async () => {
        const response = await request(app)
            .get('/api/alerta/llegada/conductor')
            .set('Authorization', `Bearer ${token}`); // token debe ser generado previamente
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('alertas');
    });
    // ----------------------------------------------------------------------------------------------- //
    // Prueba de vizualizacion de las notificaciones representante
    test('Debe listar las notificaciones del representante correctamente', async () => {
        const response = await request(app)
            .get('/api/notificaciones/representante')
            .set('Authorization', `Bearer ${token}`); // token debe ser generado previamente
    
        console.log('Response status:', response.statusCode);
        console.log('Response body:', response.body);
    
        if (response.statusCode === 404) {
            console.warn('⚠️ No hay notificaciones para este representante.');
            expect(response.body).toHaveProperty('msg', 'No tienes notificaciones');
        } else {
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('asistencia');
            expect(response.body).toHaveProperty('Eliminacion');
        }
    });
    
    
    // ----------------------------------------------------------------------------------------------- //
    // Preuba de actualizacion del perfil del representante
    test('Debe actualizar el perfil del representante correctamente', async () => {
        const perfilData = {
            nombre: 'Tadeo',
            apellido: 'Gomez',
            telefono: '1234567890',
            cedula: '1754107371',
            email: 'frjoac2303@gmail.com'
        };
    
        const response = await request(app)
            .patch('/api/actualizar/perfil/representante')
            .set('Authorization', `Bearer ${token}`) // token debe ser generado previamente
            .send(perfilData);
    
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('msg_actualizacion_perfil', 'Los datos del representante han sido actualizados exitosamente');
    });
    // ----------------------------------------------------------------------------------------------- //
});