import mongoose, { Schema, model } from 'mongoose';

const HistorialConductores = new Schema(
    {
        conductor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conductores',
            required: true,
        },
        nombreConductor: {
            type: String,
            required: true,
        },
        apellidoConductor: {
            type: String,
            required: true,
        },
        accion: {
            type: String,
            enum: ['eliminacion', 'reemplazo'],
            required: true,
        },
        fecha: {
            // Cambiar a String para almacenar solo la fecha
            type: String, 
            // Usar función normal para definir el valor predeterminado, divide la cadena de caracteres que da MongoDB
            // para que solo se guarde la fecha
            default: function() { 
                return new Date().toISOString().split('T')[0];
            },
            required: true
        },
        conductorReemplazo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conductores', 
        },
        nombreConductorReemplazo: {
            type: String,
        }, 
        apellidoConductorReemplazo: {
            type: String,
        },
        estudiantesReasignados: [
            {
                idEstudiante: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Estudiantes',
                },
                nombreEstudiante: String,
                apellidoEstudiante: String,
            },
        ],
    },
    { timestamps: true }
);

export default model('HistorialConductores', HistorialConductores);