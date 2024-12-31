import mongoose, {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'

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
        tokenEmail:{
            type: String,
            default: null
        }, 
        cedulaRepresentado: [{
            type: Number, 
            require: true, 
            trim: true
        }], 
        estadoCuenta:{
            type: Boolean, 
            default: true
        }, 
        confirmacionEmail:{
            type: Boolean, 
            default: false
        },
        notificacionEnviada:{
            type: Boolean, 
            default: false
        }
    }
,{
    timestamps:true
}
)
/// Método para cifrar el password del veterinario
paraElRegistroDeLosRepresentantes.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
paraElRegistroDeLosRepresentantes.methods.matchPassword = async function(passwordIngresada){
    const response = await bcrypt.compare(passwordIngresada,this.password)
    return response
}

// Método para crear un token 
paraElRegistroDeLosRepresentantes.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

export default model('Representantes',paraElRegistroDeLosRepresentantes)