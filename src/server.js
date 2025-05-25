// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

//Para el manejo de archivos
import os from 'os';
import fs from 'fs';
import path from 'path';

// Para las imagenes de perfiles 
import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';
import Adminrouter from './routers/admin_routers.js';
import Conductoresrouter from './routers/conductor_routers.js';
import RutasPublicas from './routers/publicas_routes.js';
//import RepresentantesRouter from './routers/representantes_routers.js';

// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port', process.env.PORT || 3000);


//Las creedenciales para usar Cloudinary 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Crear una subcarpeta 'uploads' en el directorio temporal del sistema
const tempDir = path.join(os.tmpdir(), 'uploads');
if (!fs.existsSync(tempDir)) {
    // Crea la carpeta si no existe
    fs.mkdirSync(tempDir, { recursive: true }); 
}

//Configuración de un middleware "express-fileupload" para la subida de archivos
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: tempDir,
}));

//Compatibilidad entre dominios 
app.use(cors({
    origin: ['http://localhost:5173', 'https://proyecto-frontend-tesis.onrender.com'], 
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true
}));

// Middlewares 
app.use(express.json())

// Rutas 
app.get('/',(req,res)=>{
    res.send("El servidor del sistema de recorridos para la alerta de la llegada del bus escolar Cooperativa Ciudad de Quito de la Unidad Educativa Particular EMAÚS")
})

//Rutas publicas
app.use('/api', RutasPublicas)

//Rutas de los Administradores
app.use('/api', Adminrouter)

//Rutas de los Conductores
app.use('/api', Conductoresrouter)

//Rutas de los Representantes
/*app.use('/api', RepresentantesRouter)*/

// Exportar la instancia de express por medio de app
export default app;