import mongoose, {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'
//Definición de la estructura en la base de datos 
//Esquema para el registro de los conductores
const paraElRegistroDeLosConductores= new Schema(
    {
        nombre:{
            type: String, 
            required: true, 
            trim: true
        }, 
        apellido:{
            type: String, 
            required: true, 
            trim: true 
        }, 
        telefono:{
            type: Number, 
            required: true, 
            unique: true,
            trim: true
        }, 
        generoConductor: {
            type: String,  
            trim: true
        }, 
        cedula:{
            type: Number, 
            required: true, 
            unique: true,
            trim: true
        }, 
        placaAutomovil:{
            type: String, 
            required: true, 
            unique: true,
            trim: true
        },
        rutaAsignada:{
            type: Number, 
            required: true, 
            unique: true, 
            trim: true
        }, 
        sectoresRuta:{
            type: String, 
            required: true, 
            trim: true
        }, 
        institucion:{
            type: String, 
            required: true, 
        }, 
        fotografiaDelConductor:{
            type: String, 
            required: true
        }, 
        email:{
            type: String, 
            required: true, 
            unique: true,
            trim: true 
        }, 
        password: {
            type: String, 
            trim: true 
        },   
        latitud:{
            type: Number
        }, 
        longitud:{
            type: Number
        },
        numeroEstudiantes: {
            type: Number, 
            default: 0
        },
        estudiantesRegistrados: [{
            _id:false,
            idEstudiante: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Estudiantes',
            }, 
            nombreEstudiante: {
                type: String
            },
            apellidoEstudiante: {
                type: String
            },
            cedulaEstudiante: {
                type: Number
            },
            paraleloEstudiante: {
                type: String
            },
            nivelEscolarEstudiante: {
                type: String
            }

        }], 
        token: {
            type: String,
            default: null
        },
        tokenEmail:{
            type: String,
            default: null
        }, 
                                                                                   
    }
, { timestamps: true}
);

// Método para cifrar el password del conductor
paraElRegistroDeLosConductores.methods.encrypPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}

// Método para verificar si el password ingresado es el mismo de la BDD
paraElRegistroDeLosConductores.methods.matchPassword = async function(passwordIngresada){
    const response = await bcrypt.compare(passwordIngresada,this.password)
    return response
}

// Método para crear un token 
paraElRegistroDeLosConductores.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

// Metodo para ingresar un estudiante
paraElRegistroDeLosConductores.methods.ingresarEstudiante = function(estudianteId){
    this.estudiantesRegistrados.push(estudianteId)
}

// Método para la actualización de la lista de estudiantes registrados del conductor 
paraElRegistroDeLosConductores.methods.actualizarListaEstudiantes = function(estudianteActualizado, estudianteId){
    // Asegúrate de que estudianteId sea una cadena
    const estudianteIdStr = estudianteId.toString();

    // Encuentra el índice del estudiante en el array estudiantesRegistrados
    const index = this.estudiantesRegistrados.findIndex(estudiante => estudiante.idEstudiante && estudiante.idEstudiante.toString() === estudianteIdStr);

    // Si no se encuentra el estudiante, devuelve un error
    if (index === -1) return {error: 'No se ha encontrado el estudiante'}

    // Actualiza los datos del estudiante
    this.estudiantesRegistrados[index].nombreEstudiante = estudianteActualizado.nombreEstudiante;
    this.estudiantesRegistrados[index].apellidoEstudiante = estudianteActualizado.apellidoEstudiante;
    this.estudiantesRegistrados[index].cedulaEstudiante = estudianteActualizado.cedulaEstudiante;
    this.estudiantesRegistrados[index].paraleloEstudiante = estudianteActualizado.paraleloEstudiante;
    this.estudiantesRegistrados[index].nivelEscolarEstudiante = estudianteActualizado.nivelEscolarEstudiante;
    
};

// Método para la eliminación de un estudiante de la lista de estudiantes registrados del conductor
paraElRegistroDeLosConductores.methods.eliminarEstudiante = function(estudianteId){
    // Asegúrate de que estudianteId sea una cadena
    const estudianteIdStr = estudianteId.toString();

    // Encuentra el índice del estudiante en el array estudiantesRegistrados
    const index = this.estudiantesRegistrados.findIndex(est => est.idEstudiante && est.idEstudiante.toString() === estudianteIdStr);

    // Si no se encuentra el estudiante, devuelve un error
    if (index === -1) return {error: 'No se ha encontrado el estudiante'}

    // Elimina el estudiante de la lista
    this.estudiantesRegistrados.splice(index, 1);
};

export default model('Conductores',paraElRegistroDeLosConductores)