// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

// Para las imagenes de perfiles 
import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';
import Adminrouter from './routers/admin_routers.js';
import Conductoresrouter from './routers/conductor_routers.js';
import RepresentantesRouter from './routers/representantes_routers.js';

// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)

//Las creedenciales para usar Cloudinary 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
//Configuración de un middleware "express-fileupload" para la subida de archivos
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/conductores/',
}));

//Compatibilidad entre dominios 
app.use(cors())

// Middlewares 
app.use(express.json())

// Rutas 
app.get('/',(req,res)=>{
    res.send("El servidor del sistema de recorridos para la alerta de la llegada del bus escolar Cooperativa Ciudad de Quito de la Unidad Educativa Particular EMAÚS")
})
//Rutas de los Administradores
app.use('/api', Adminrouter)

//Rutas de los Conductores
app.use('/api', Conductoresrouter)

//Rutas de los Representantes
app.use('/api', RepresentantesRouter)

// Exportar la instancia de express por medio de app
export default app;