import mongoose, {Schema, model} from 'mongoose'
const NotificacionesParaRepresentante = new Schema({
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
    distancia: {
        type: Number,
        default: 0
    },
    tiempo: {
        type: Number,
        default: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})
export default model('NotificacionesRepresentantes', NotificacionesParaRepresentante)