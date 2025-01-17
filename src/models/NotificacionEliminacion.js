import mongoose, {Schema, model} from 'mongoose'
const NotificacionesEliminacionEstudiantes = new Schema({
    conductor: {
        type: Schema.Types.ObjectId,
        ref: 'Conductores',
        required: true
    },
    representante: {
        type: Schema.Types.ObjectId,
        ref: 'Representantes',
        required: true
    },
    mensaje: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true
}); 
// Middleware para validar que la fecha no sea anterior a la fecha actual ni futura
NotificacionesEliminacionEstudiantes.pre('save', function (next) {
    // Obtiene la fecha actual en formato ISO 8601 y la divide para obtener solo la fecha
    const today = new Date().toISOString().split('T')[0];
    //Compara la fecha actual con la fecha de la asistencia
    if (this.fecha !== today) {
        return next(new Error('La fecha debe ser la fecha actual.'));
    }
    next();
});

export default model('NotificacionesEliminacionEstudiantes', NotificacionesEliminacionEstudiantes)