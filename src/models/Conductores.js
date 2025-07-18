import mongoose, {Schema, model} from 'mongoose'
import bcrypt from 'bcryptjs'
import { env } from 'process';
import { type } from 'os';
//Definición de la estructura en la base de datos 
//Esquema para el registro de los conductores
const paraElRegistroDeLosConductores= new Schema(
    {
        roles: {
            type: [String],
            enum: ['conductor', 'admin'],
            default: ['conductor']
        },
        esReemplazo:{
            type: String,
            enum: ['Sí', 'No'],
            required: true
        },
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
        cooperativa:{
            type: String,
            required: true,
            trim: true
        },
        telefono:{
            type: String, 
            required: true, 
            unique: true,
            trim: true
        }, 
        generoConductor: {
            type: String, 
            enum: ["Femenino", "Masculino", "Prefiero no decirlo"], 
            required: true,
            trim: true
        }, 
        cedula:{
            type: String, 
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
            default: null
        }, 
        sectoresRuta:{
            type: String, 
            default: null
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
            required: true,
            trim: true 
        },   
        /*latitud:{
            type: Number
        }, 
        longitud:{
            type: Number
        },*/
        numeroEstudiantes: {
            type: Number, 
            default: 0
        },
        /*estudiantesRegistrados: [{
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

        }],*/ 
        token: {
            type: String,
            default: null
        },
        tokenExpiracion:{
            type: Date, 
            default: null
        },
        tokenEmail:{
            type: String,
            default: null
        },
        emailTemporal:{
            type: String,
            default: null
        }, 
        tokenEmailExpiracion:{
            type: Date,
            default: null
        },
        tokenBloqueoCuenta:{
            type: String,
            default: null
        },
        tokenBloqueoCuentaExpiracion:{
            type: Date,
            default: null
        },
        estado:{
            type: String, 
            enum: [
                'Activo',
                'Inactivo',
                'Disponible',
                'Ocupado',
                'Trabaja como conductor', 
                'No trabaja como conductor', 
                'Bloqueado por intentos fallidos'
            ], 
            required: true
        },
        requiereCambioContrasenia:{
            type: Boolean,
            default: true
        },         
        numeroDeIntentos:{
            type: Number,
            default: 0
        }                                            
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
paraElRegistroDeLosConductores.methods.crearToken = function(tipo){
    const tokenGenerado = Math.random().toString(36).slice(2)
    if(tipo === 'recuperacion'){
        this.token = tokenGenerado; 
        //Tiempo en el token es válido
        this.tokenExpiracion = Date.now() + 1800000;
    }else if(tipo === 'confirmacionCorreo'){
        this.tokenEmail = tokenGenerado; 
        //Tiempo en el token es válido
        this.tokenEmailExpiracion = Date.now() + 3600000;
    }else if(tipo === 'bloqueoDeCuenta'){
        this.tokenBloqueoCuenta = tokenGenerado; 
        //Tiempo en el token es válido
        this.tokenBloqueoCuentaExpiracion = Date.now() + 3600000;
    };
    return tokenGenerado;
}

// Metodo para ingresar un estudiante
/*paraElRegistroDeLosConductores.methods.ingresarEstudiante = function(estudianteId){
    this.estudiantesRegistrados.push(estudianteId)
}*/

// Método para la actualización de la lista de estudiantes registrados del conductor 
/*paraElRegistroDeLosConductores.methods.actualizarListaEstudiantes = function(estudianteActualizado, estudianteId){
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
    
};*/

// Método para la eliminación de un estudiante de la lista de estudiantes registrados del conductor
/*paraElRegistroDeLosConductores.methods.eliminarEstudiante = function(estudianteId){
    // Asegúrate de que estudianteId sea una cadena
    const estudianteIdStr = estudianteId.toString();

    // Encuentra el índice del estudiante en el array estudiantesRegistrados
    const index = this.estudiantesRegistrados.findIndex(est => est.idEstudiante && est.idEstudiante.toString() === estudianteIdStr);

    // Si no se encuentra el estudiante, devuelve un error
    if (index === -1) return {error: 'No se ha encontrado el estudiante'}

    // Elimina el estudiante de la lista
    this.estudiantesRegistrados.splice(index, 1);
};*/

//Metodo para ingresar apenas inicie el servidor un conductor administrador que registrará a los demás conductores
paraElRegistroDeLosConductores.statics.ingresarConductorAdministrador = async function(){
    const existeElConductorAdmin = await this.findOne({ roles: { $in: ['admin'] } }); 
    const contraseniaQuemada = process.env.ADMIN_PASSWORD; 

    if(!existeElConductorAdmin){
        const conductorAdmin = new this({
            roles: ['admin', 'conductor'],
            nombre: 'Segundo Manuel',
            apellido: 'Flores Ramírez',
            cooperativa: 'Furgo Planta',
            telefono: process.env.TELEFONO_ADMINISTRADOR,
            generoConductor: 'Femenino',
            esReemplazo: 'No',
            cedula: process.env.CEDULA_ADMINISTRADOR,   
            placaAutomovil: process.env.PLACA_ADMINISTRADOR,
            rutaAsignada: 1,
            sectoresRuta: 'La Magdalena',
            institucion: 'Unidad Educativa Particular Emaús',
            fotografiaDelConductor: 'https://res.cloudinary.com/dwvqq3ugp/image/upload/v1750309803/admin_p5ljhi.jpg',
            email: process.env.ADMIN_EMAIL, 
            password: contraseniaQuemada, 
            estado: 'Trabaja como conductor',
            requiereCambioContrasenia: false,
        });

        //Encriptar la contraseña anteriormente quemada
        conductorAdmin.password = await conductorAdmin.encrypPassword(contraseniaQuemada);

        //Guardar en la base de datos 
        await conductorAdmin.save();

        console.log('Conductor administrador creado exitosamente');
    } else{
        console.log('El conductor administrador ya existe');
    }
}
    

export default model('Conductores',paraElRegistroDeLosConductores)