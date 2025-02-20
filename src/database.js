import mongoose from 'mongoose'
import Conductores from './models/Conductores.js';

mongoose.set('strictQuery', true)

const connection = async()=>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI_PRODUCTION)
        console.log(`Database is connected on ${connection.host} - ${connection.port}`)

        // Llamar al método para registrar el administrador
        await Conductores.ingresarConductorAdministrador();
    } catch (error) {
        console.log(error);
    }
}

export default  connection