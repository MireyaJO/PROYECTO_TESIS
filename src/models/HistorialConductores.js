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
            trim: true
        },
        apellidoConductor: {
            type: String,
            required: true,
            trim: true
        },
        accion: {
            type: String,
            enum: ['Reemplazo', 'Activación'],
            required: true, 
            trim: true
        },
        rutaHaCubrir:{
            type:Number,
            required : function () {
                return this.accion === 'Reemplazo';  
            }, 
            trim: true
        }, 
        tipoReemplazo: {
            type: String,
            enum: ['Temporal', 'Permanente'],
            required : function () {
                return this.accion === 'Reemplazo';  
            }, 
            trim: true
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
            required: function () {
                return this.accion === 'Reemplazo';  
            }, 
            trim: true
        },
        nombreConductorReemplazo: {
            type: String,
            required: function () {
                return this.accion === 'Reemplazo';  
            },
            trim: true
        }, 
        apellidoConductorReemplazo: {
            type: String,
            required : function () {
                return this.accion === 'Reemplazo';  
            },
            trim: true
        },
        numeroDeEstudiantesAsignados: {
            type: Number,
            required: true
        },
    },
    { timestamps: true }
);

export default model('Historial', HistorialConductores);