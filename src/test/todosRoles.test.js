import request from 'supertest'; // Supertest para realizar peticiones HTTP
import mongoose from 'mongoose'; // Mongoose para gestionar la conexión de la base de datos
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

// ----------------------------------------------------------------------------------------------- //

// Grupo de pruebas para el administrador
describe('Pruebas de las rutas de todos los Roles', () => {
    // Variable del despliegue del Backend
    const app = "https://proyecto-tesis-1.onrender.com";
    // Prueba: Inicio de sesión del administrador
    test('Debe iniciar sesión correctamente con credenciales válidas', async () => {
        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            throw new Error('Las variables de entorno ADMIN_EMAIL y ADMIN_PASSWORD no están configuradas.');
        }

        const response = await request(app)
            .post('/api/login') // Endpoint de inicio de sesión
            .send({
                email: process.env.ADMIN_EMAIL, // Email válido
                password: process.env.ADMIN_PASSWORD, // Contraseña válida
            });

        console.log(response.body);
        expect(response.statusCode).toBe(200); // Verifica que el código de estado sea 200
        expect(response.body).toHaveProperty('token'); // Verifica que el token se devuelva correctamente
        expect(response.body.msg_login_admin).toBe('Bienvenido administrador'); // Verifica el mensaje de respuesta
    });

    //------------------------------------------------------------------------------------------------------------------//
    test('Debe iniciar sesión correctamente con credenciales válidas para un conductor', async () => {
            // Credenciales válidas del conductor
            const email = 'frjoac2303@gmail.com';
            const password = '09619e8ff86e3af2';
            const role = "conductor"
        
            const response = await request(app)
                .post('/api/login') // Endpoint de inicio de sesión
                .send({
                    email,
                    password,
                    role
                });
        
            // Imprime la respuesta para verificar errores
            console.log(response.body);
            // Verifica que el código de estado sea 200
            expect(response.statusCode).toBe(200);
        
            // Verifica que el token se devuelva correctamente
            expect(response.body).toHaveProperty('token');
        
            // Verifica el mensaje de respuesta
            expect(response.body.msg_login_conductor).toBe('Bienvenido conductor');
        });
    
    //------------------------------------------------------------------------------------------------------------------//
    test('Debe iniciar sesión correctamente en el rol de Representante', async () => {
        // Credenciales válidas del conductor
        const email = 'frjoac2303@gmail.com';
        const password = '09619e8ff86e3af2';
        const role = "representante"
    
        const response = await request(app)
            .post('/api/login') // Endpoint de inicio de sesión
            .send({
                email,
                password,
                role
            });
    
        // Imprime la respuesta para verificar errores
        console.log(response.body);
        // Verifica que el código de estado sea 200
        expect(response.statusCode).toBe(200);
    
        // Verifica que el token se devuelva correctamente
        expect(response.body).toHaveProperty('token');
    
        // Verifica el mensaje de respuesta
        expect(response.body.msg_login_conductor).toBe('Bienvenido conductor');
    });
    
    
    
    //------------------------------------------------------------------------------------------------------------------//
    // Prueba: Recuperación de contraseña con un email válido
    test('Debe recuperar la contraseña con un email valido', async () => {
        const emailValido = 'frjoac2303@gmail.com'; // Cambia por un email válido en tu base de datos

        const response = await request(app)
            .post('/api/recuperacion/contrasenia')
            .send({ email: emailValido });

        // Imprime la respuesta para verificar errores
        console.log(response.body);
        expect(response.statusCode).toBe(200); // Verifica que el código de estado sea 200
        expect(response.body.msg_recuperacion_contrasenia).toBe('Correo de recuperación de contraseña enviado satisfactoriamente'); // Verifica el mensaje de éxito
    });
    
    //------------------------------------------------------------------------------------------------------------------//
    // Prueba: Comprobación de un token válido
    test('Debe confirmar un token válido', async () => {
        const token = 'qs1ozk98zcc'; // Cambia por un token válido en tu base de datos

        const response = await request(app)
            .get(`/api/comprobar/token/${token}`);

        // Imprime la respuesta para verificar errores
        console.log(response.body);
        expect(response.statusCode).toBe(200); // Verifica que el código de estado sea 200
        expect(response.body.msg_recuperacion_contrasenia).toBe('Token confirmado, ya puedes crear tu nuevo password'); // Verifica el mensaje de éxito
    });
    
    //------------------------------------------------------------------------------------------------------------------//
    // Prueba: Creación de una nueva contraseña con un token válido
    test('Debe crear una nueva contraseña con un token válido', async () => {
        const token = '8pgyqho4apx'; // Cambia por un token válido en tu base de datos
        const nuevaContrasenia = '123456';

        const response = await request(app)
            .patch(`/api/nueva/contrasenia/${token}`)
            .send({
                passwordActual: nuevaContrasenia,
                passwordActualConfirm: nuevaContrasenia,
            });
        // Imprime la respuesta para verificar errores
        console.log(response.body);
        expect(response.statusCode).toBe(200); // Verifica que el código de estado sea 201
        expect(response.body.msg_recuperacion_contrasenia).toBe('La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse'); // Verifica el mensaje de éxito
    });
    
    //------------------------------------------------------------------------------------------------------------------//
    // Prueba: Confirmación de un cambio de correo con un token válido
    test('Debe confirmar un cambio de correo con un token válido', async () => {
        const token = 'qs1ozk98zcc'; // Cambia por un token válido en tu base de datos

        const response = await request(app)
            .get(`/api/cambio/email/${token}`)

        // Imprime la respuesta para verificar errores
        console.log(response.body);
        expect(response.statusCode).toBe(200); // Verifica que el código de estado sea 200
        expect(response.body.msg).toBe('Correo electrónico actualizado exitosamente, puede logearse con su nuevo email'); // Verifica el mensaje de éxito
    });
});


