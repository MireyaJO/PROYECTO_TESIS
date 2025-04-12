import mongoose, { Schema, model } from 'mongoose';
//Esquema para guardar las acciones de los conductores para reportes de fronted 
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
            enum: ['Reemplazo', 'Activación'],
            required: true,
        },
        tipoReemplazo: {
            type: String,
            enum: ['Temporal', 'Permanente'],
            required: true,
        },
        fechaEnQueInicio: {
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
            required: true,
        },
        nombreConductorReemplazo: {
            type: String,
            required: true,
        }, 
        apellidoConductorReemplazo: {
            type: String,
            required: true,
        },
        numeroDeEstudiantesAsignados: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default model('HistorialConductores', HistorialConductores);