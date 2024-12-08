// Requerir los módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';



// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.set('port',process.env.port || 3000)
app.use(cors())

// Middlewares 
app.use(express.json())


// Variables globales


// Rutas 
app.get('/',(req,res)=>{
    res.send("El servidor del sistema de recorridos para la gestión de asistencias y alerta de la llegada del bus escolar Cooperativa Ciudad de Quito de la Unidad Educativa Particular EMAÚS")
})

// Exportar la instancia de express por medio de app
export default  app