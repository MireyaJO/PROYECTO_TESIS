import mongoose, {Schema, model} from 'mongoose'

//Definición de la estructura en la base de datos 
//Esquema para el registro de asistencias
const paraElRegistroDeAsistenciasManana= new Schema({
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
    estudianteAsistieronManana:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ],
    estudianteNoAsistieronManana:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ]
}, {
    timestamps: true
}
); 
export default model('AsistenciasManana', paraElRegistroDeAsistenciasManana); 