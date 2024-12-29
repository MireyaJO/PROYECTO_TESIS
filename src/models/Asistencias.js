import {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'
//Definición de la estructura en la base de datos 
//Esquema para el registro de asistencias
const paraElRegistroDeAsistencias= new Schema({
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
            type: Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ],
    estudianteNoAsistieronManana:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ],
    estudianteAsistieronTarde: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Estudiantes'
        }
    ],
    estudianteNoAsistieronTarde:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Estudiantes'
        }
    ]
}, {
    timestamps: true
}
); 
export default model('Asistencias', paraElRegistroDeAsistencias); 