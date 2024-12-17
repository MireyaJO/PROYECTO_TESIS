import mongoose, {Schema, model} from 'mongoose'


//Definición de la estructura en la base de datos 
//Esquema para el registro de los estudiantes
const paraElRegistroDeLosEstudiantes= new Schema(
    {
        nombreEstudiante:{
            type: String, 
            require: true, 
            trim: true
        }, 
        apellidoEstudiante:{
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
        numeroDeCedula:{
            type: Number, 
            require: true, 
            unique: true,
            trim: true
        }, 
        rutaDelEstudiante:{
            type: Number, 
            require: true
        }, 
        ubicacionEstudiante:{
            type: String, 
            require: true, 
            trim: true
        }, 
        institucionEstudiante:{
            type: String, 
            require: true, 
        },  
        recoCompletoOMedio:{
            type: String, 
            require: true
        }, 
        conductor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conductores',
            require: true
        },                                                                
    }
, { timestamps: true}
);

export default model('Estudiantes',paraElRegistroDeLosEstudiantes)