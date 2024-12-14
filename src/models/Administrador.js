import {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'
//Definición de la estructura en la base de datos 
//Esquema para el registro de los conductores
const paraElRegistroDeLosConductores= new Schema(
    {
        nombreConductor:{
            type: String, 
            require: true, 
            trim: true
        }, 
        apellidoConductor:{
            type: String, 
            require: true, 
            trim: true 
        }, 
        generoDelConductor: {
            type: String, 
            require: true, 
            trim: true
        }, 
        numeroDeCedula:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        numeroDeLaPlacaDelAutomovil:{
            type: String, 
            require: true, 
            unique: true,
            trim: true
        },
        numeroDeRutaAsignada:{
            type: Number, 
            require: true, 
            unique: true, 
            trim: true
        }, 
        sectoresDeLaRutaAsignada:{
            type: String, 
            require: true, 
            trim: true
        }, 
        institucionALaQueSeRealizaElReco:{
            type: String, 
            require: true, 
        }, 
        fotografiaDelConductor:{
            type: String, 
            require: true
        }, 
        emailDelConductor:{
            type: String, 
            require: true, 
            unique: true,
            trim: true 
        }, 
        passwordParaElConductor: {
            type: String, 
            trim: true 
        },   
        numeroDeEstudiantes: {
            type: Number, 
            default: 0
        },
        estudiantesRegistrados:{
            type: [String],
            default: []
        }
                                                                                   
    }
, { timestamps: true}
);

// Método para cifrar el password del conductor
paraElRegistroDeLosConductores.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
paraElRegistroDeLosConductores.methods.matchPassword = async function(password){
    const response = await bcrypt.compare(password,this.passwordParaElConductor)
    return response
}

export default model('Conductores',paraElRegistroDeLosConductores)