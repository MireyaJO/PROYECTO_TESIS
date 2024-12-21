import mongoose, {Schema, model} from 'mongoose'

//Definición de la estructura en la base de datos 
//Esquema para el registro de los estudiantes
const paraElRegistroDeLosEstudiantes= new Schema(
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
        nivelEscolar: {
            type: String, 
            require: true, 
            trim: true
        }, 
        paralelo:{
            type: String, 
            require: true, 
            trim: true
        },
        cedula:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        ruta:{
            type: Number, 
            require: true
        }, 
        ubicacionDomicilio:{
            type: String, 
            require: true, 
            trim: true
        }, 
        institucion:{
            type: String, 
            require: true, 
        },  
        recoCompletoOMedio:{
            type: String, 
            require: true
        }, 
        latitud:{
            type: Number
        }, 
        longitud:{
            type: Number
        },
        conductor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conductores',
            require: true
        },     
        representantes:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Representantes',
            require: true
        }                                                           
    }
, { timestamps: true}
);

export default model('Estudiantes',paraElRegistroDeLosEstudiantes)