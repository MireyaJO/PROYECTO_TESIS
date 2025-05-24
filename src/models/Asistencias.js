/*import mongoose, { Schema, model } from 'mongoose';

// Definición de la estructura en la base de datos 
// Esquema para el registro de asistencias
const paraElRegistroDeAsistencias= new Schema({
    turno:{
        type: String,
        enum: ['Mañana', 'Tarde'],
        required: true
    }, 
    conductor: {
        type: Schema.Types.ObjectId,
        ref: 'Conductores',
        required: true
    },
    fecha: {
        type: String, // Cambiar a String para almacenar solo la fecha
        // Usar función normal para definir el valor predeterminado, divide la cadena de caracteres que da MongoDB
        // para que solo se guarde la fecha
        default: function() { 
            return new Date().toISOString().split('T')[0];
        },
        required: true
    },
    estudiantes: [
        {
            _id: false,
            estudiante: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Estudiantes'
            },
            asistio: {
                type: Boolean,
                default: false
            }
        }
    ]
}, {
    timestamps: true
});

// Middleware para validar que la fecha no sea anterior a la fecha actual ni futura
paraElRegistroDeAsistencias.pre('save', function (next) {
    // Obtiene la fecha actual en formato ISO 8601 y la divide para obtener solo la fecha
    const today = new Date().toISOString().split('T')[0];
    //Compara la fecha actual con la fecha de la asistencia
    if (this.fecha !== today) {
        return next(new Error('La fecha debe ser la fecha actual.'));
    }
    next();
});

export default model('Asistencias', paraElRegistroDeAsistencias);*/