import mongoose, {Schema, model} from 'mongoose'

//Definición de la estructura en la base de datos 
//Esquema para el registro de los estudiantes
const paraElRegistroDeLosEstudiantes= new Schema(
    {
        nombre:{
            type: String, 
            required: true, 
            trim: true
        }, 
        apellido:{
            type: String, 
            required: true, 
            trim: true 
        }, 
        nivelEscolar: {
            type: String, 
            required: true, 
            trim: true
        }, 
        paralelo:{
            type: String, 
            required: true, 
            trim: true
        },
        cedula:{
            type: String, 
            required: true, 
            unique: true,
            trim: true
        }, 
        ruta:{
            type: Number, 
            required: true
        }, 
        ubicacionDomicilio:{
            type: String, 
            required: true, 
            trim: true
        }, 
        institucion:{
            type: String, 
            required: true, 
        },  
        turno:{
            type: String, 
            required: true, 
            trim: true
        }, 
        genero:{
            type: String, 
            trim: true
        },
        /*latitud:{
            type: Number
        }, 
        longitud:{
            type: Number
        },*/
        conductor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conductores',
            required: true
        }/*,     
        representantes:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Representantes',
            required: true
        }]*/                                               
    }
, { timestamps: true}
);

export default model('Estudiantes',paraElRegistroDeLosEstudiantes)