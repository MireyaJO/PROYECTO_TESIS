import mongoose, {Schema, model} from 'mongoose'

//Definición de la estructura en la base de datos 
//Esquema para el registro de asistencias
const paraElRegistroDeAsistenciasTarde= new Schema({
    conductor: {
        type: Schema.Types.ObjectId,
        ref: 'Conductores', 
        required: true
    }, 
    fecha: {
        type: Date, 
        default: Date.now, 
        required: true
    },
    estudianteAsistieronTarde: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ],
    estudianteNoAsistieronTarde: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ]
}, {
    timestamps: true
}
); 
export default model('AsistenciasTarde', paraElRegistroDeAsistenciasTarde); 