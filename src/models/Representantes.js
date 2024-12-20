import mongoose, {Schema, model} from 'mongoose'

//Definición de la estructura en la base de datos 
//Esquema para el registro de los representates de los estudiantes
const paraElRegistroDeLosRepresentantes = new Schema(
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
        genero: {
            type: String,  
            trim: true
        }, 
        cedula:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        institucion:{
            type: String, 
            require: true, 
        }, 
        fotografia:{
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
        token: {
            type: String,
            default: null
        },
        cedulaRepresentado: [{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }], 
        estadoCuenta:{
            type: Boolean, 
            default: true
        }, 
        confirmacionEmail:{
            type: Boolean, 
            default: false
        }

    }
)
export default model('Representantes',paraElRegistroDeLosRepresentantes)