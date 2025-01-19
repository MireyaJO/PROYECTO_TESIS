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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//
//const request = require('supertest');

//-----------------------------------------------------------------------------------------------//

// Grupo de pruebas para el administrador
describe('Pruebas de rutas del administrador', () => {
    const app = "https://proyecto-tesis-1.onrender.com";
  
    // Prueba: Inicio de sesión del administrador
    // test('Debe iniciar sesión correctamente con credenciales válidas', async () => {
    //   // Verifica que las variables de entorno estén configuradas
    //   if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    //     throw new Error('Las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD no están configuradas.');
    //   }
  
    //   const response = await request(app)
    //     .post('/api/login') // Endpoint de inicio de sesión
    //     .send({
    //       email: process.env.ADMIN_EMAIL, // Email válido
    //       password: process.env.ADMIN_PASSWORD, // Contraseña válida
    //     });
      
    //   console.log(response.body);
    //   // Verifica que el código de estado sea 200
    //   expect(response.statusCode).toBe(200);
  
    //   // Verifica que el token se devuelva correctamente
    //   expect(response.body).toHaveProperty('token');
  
    //   // Verifica el mensaje de respuesta
    //   expect(response.body.msg_login_admin).toBe('Bienvenido administrador');
    // });
  //-----------------------------------------------------------------------------------------------//

  // Prueba: Registro de un conductor
  test('Debe registrar un nuevo conductor', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MjQyOTM2LCJleHAiOjE3MzcyNDY1MzZ9.XcVa1M9Gmchy1e4GzEbqTV7U-qSk9RyiyD-x_JNiZmw'; // Token válido para pruebas

    // Ruta del archivo de imagen local
    const filePath = path.join(__dirname, 'files', 'hm3.jpg');

    // Verificar si el archivo existe antes de ejecutar la prueba
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo ${filePath} no existe. Asegúrate de que esté en la ubicación correcta.`);
    }

    const response = await request(app)
      .post('/api/registro/conductores')
      .set('Authorization', `Bearer ${token}`) // Enviar el token de autenticación
      .field('nombre', 'Andres')
      .field('apellido', 'Gomez')
      .field('rutaAsignada', '5')
      .field('sectoresRuta', 'La vicentina')
      .field('telefono', '0994537288')
      .field('placaAutomovil', 'PHG2380')
      .field('cedula', '1734205831')
      .field('email', 'francishj369@gmail.com')
      .field('generoConductor', 'Masculino')
      .field('institucion', 'Unidad Educativa Particular Emaús')
      .attach('fotografiaDelConductor', filePath); // Archivo local
    
    console.log(response.body); // Imprime la respuesta del servidor para ver el error

    // Verifica que el conductor fue creado exitosamente
    expect(response.status).toBe(201);
    expect(response.body.msg_registro_conductor).toBe('Conductor registrado exitosamente');
  });


  //-----------------------------------------------------------------------------------------------//
  // Prueba: Listar conductores
  // test('Debe listar todos los conductores registrados', async () => {
  //   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MjI5MTA4LCJleHAiOjE3MzcyMzI3MDh9.7l-G9nmdwA8S5BG5nrDRI0G8tGJk6uNkdHeHTBx37z4'; // Genera un token válido para pruebas

  //   const response = await request(app)
  //     .get('/api/listar/conductores')
  //     .set('Authorization', `Bearer ${token}`); // Enviar el token de autenticación

  //   // Verifica que el código de estado sea 200 y se devuelvan los conductores
  //   console.log(response.body);
  //   expect(response.status).toBe(200);
  //   expect(response.body.msg_listar_conductores).toBe('Los conductores se han encontrado exitosamente');
  //   expect(response.body.conductores).toBeInstanceOf(Array);
  // });
  //-----------------------------------------------------------------------------------------------//

  // Prueba: Buscar conductor por ruta
//   test('Debe encontrar un conductor por la ruta asignada', async () => {
//     const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MTY2NDU0LCJleHAiOjE3MzcxNzAwNTR9.KQbDFwPEHKSqCM7xB8k7hGKZSKGcglDl0rIQk6JXg8w'; // Genera un token válido para pruebas

//     const response = await request(app)
//       .get('/api/buscar/conductor/ruta/2')
//       .set('Authorization', `Bearer ${token}`); // Enviar el token de autenticación  
//     console.log(response.body);
//     // Verifica que el código de estado sea 200 y se devuelva el conductor
//     expect(response.status).toBe(200);
//     expect(response.body.msg_buscar_conductor_ruta).toContain('se han encontrado exitosamente');
//   });
//   //-----------------------------------------------------------------------------------------------//
  // Prueba: Eliminar un conductor
//   test('Debe eliminar un conductor por su ID', async () => {
//     const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MTcwMzA5LCJleHAiOjE3MzcxNzM5MDl9.h0Y2R1KSSJ14-EbMGgSbMphbPIvvhx54eXSuiUmIDdA'; // Genera un token válido para pruebas

//     const conductorId = '678b18c7e65e79a5b268e575'; // ID del conductor existente para pruebas

//     const response = await request(app)
//       .delete(`/api/eliminar/conductor/${conductorId}`)
//       .set('Authorization', `Bearer ${token}`); // Enviar el token de autenticación
    
//     // Verifica que el conductor fue eliminado correctamente
//     console.log(response.body); 
//     expect(response.status).toBe(200);
//     expect(response.body.msg).toContain('ha sido eliminado exitosamente');
//   });

//   const path = require('path');

// // Prueba: Actualizar un conductor por ID
//     test('Debe actualizar un conductor por ID', async () => {
//     const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MTcwMzA5LCJleHAiOjE3MzcxNzM5MDl9.h0Y2R1KSSJ14-EbMGgSbMphbPIvvhx54eXSuiUmIDdA'; // Token válido
//     const conductorId = '678b1feae65e79a5b268e58c'; // Reemplaza con un ID válido de prueba
//     const filePath = path.join(__dirname, 'files', 'woman1.jpg'); // Ruta al archivo local

//     const response = await request(app)
//         .patch(`/api/actualizar/conductor/${conductorId}`)
//         .set('Authorization', `Bearer ${token}`) // Enviar el token de autenticación
//         .field('nombre', 'Ximena')
//         .field('apellido', 'Santa')
//         .field('rutaAsignada', '3')
//         .field('sectoresRuta', 'La armenia')
//         .field('telefono', '0995345722')
//         .field('placaAutomovil', 'PDG7890')
//         .field('generoConductor', 'Femenino')
//         .field('cedula', '1538593741')
//         .field('email', 'ximena230@gmail.com')
//         .field('institucion', 'Unidad Educativa Particular Emaús')
//         .attach('fotografiaDelConductor', filePath); // Archivo local

//     // Verifica que la actualización fue exitosa
//     console.log(response.body);
//     expect(response.status).toBe(200);
//     expect(response.body.msg_actualizacion).toBe('Conductor actualizado exitosamente');

//     // Verifica que los datos fueron actualizados correctamente
//     expect(response.body.conductor.nombre).toBe('Maria');
//     expect(response.body.conductor.apellido).toBe('Vasquez');
//     expect(response.body.conductor.rutaAsignada).toBe('4');
//     expect(response.body.conductor.email).toBe('ximena22@gmail.com');
//     });

// Prueba: Actualizar un conductor por ID
    // test('Debe actualizar ruta y sectores de un conductor por ID', async () => {
    //     const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1pcmVnYXJjaWEyMDVAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzM3MjIwMjUxLCJleHAiOjE3MzcyMjM4NTF9.u6-Adp2wszYuGlQp3xh05WHrbehC_hfPiGXNafpa0HE'; // Token válido
    //     const conductorId = '678b1feae65e79a5b268e58c'; // Reemplaza con un ID válido de prueba

    //     const response = await request(app)
    //         .patch(`/api/actualizar/conductor/${conductorId}`)
    //         .set('Authorization', `Bearer ${token}`) // Enviar el token de autenticación
    //         .send({
    //             rutaAsignada: '7',
    //             sectoresRuta: 'La carolina'
    //         });

    //     // Verifica que la actualización fue exitosa
    //     console.log(response.body);
    //     expect(response.status).toBe(200);
    // });
});