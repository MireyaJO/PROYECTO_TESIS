import {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'
//Definición de la estructura en la base de datos 
//Esquema para el registro de los conductores
const paraElRegistroDeLosConductores= new Schema(
    {
        nombre:{
            type: String, 
            require: true, 
            trim: true
        }, 
        apellido:{
            type: String, 
            require: true, 
            trim: true 
        }, 
        telefono:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        generoConductor: {
            type: String,  
            trim: true
        }, 
        cedula:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        placaAutomovil:{
            type: String, 
            require: true, 
            unique: true,
            trim: true
        },
        rutaAsignada:{
            type: Number, 
            require: true, 
            unique: true, 
            trim: true
        }, 
        sectoresRuta:{
            type: String, 
            require: true, 
            trim: true
        }, 
        institucion:{
            type: String, 
            require: true, 
        }, 
        fotografiaDelConductor:{
            type: String, 
            require: true
        }, 
        email:{
            type: String, 
            require: true, 
            unique: true,
            trim: true 
        }, 
        password: {
            type: String, 
            trim: true 
        },   
        latitud:{
            type: Number
        }, 
        longitud:{
            type: Number
        },
        numeroEstudiantes: {
            type: Number, 
            default: 0
        },
        estudiantesRegistrados:{
            type: [String],
            default: []
        }, 
        token: {
            type: String,
            default: null
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
paraElRegistroDeLosConductores.methods.matchPassword = async function(passwordIngresada){
    const response = await bcrypt.compare(passwordIngresada,this.password)
    return response
}

// Método para crear un token 
paraElRegistroDeLosConductores.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

export default model('Conductores',paraElRegistroDeLosConductores)