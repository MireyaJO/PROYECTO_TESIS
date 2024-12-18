import Conductores from '../models/Administrador.js';
import {createToken} from '../middlewares/autho.js';
import Estudiantes from '../models/Conductor.js';
import {recuperacionContrasenia} from "../config/nodemailer.js"; 

//Registro de los estudiantes
const RegistroDeLosEstudiantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombreEstudiante,
        apellidoEstudiante,
        nivelEscolar,
        paralelo,
        numeroDeCedula,
        ubicacionEstudiante,
        recoCompletoOMedio
    } = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Comprobar el tamaño de la cedula
    if(numeroDeCedula.toString().length !== 10){
        return res.status(400).json({ msg: "Lo sentimos, el número de cédula debe tener 10 dígitos" });
    }

    //Comprobar que el nivel escolar se encuentre bien escrito 
    if(nivelEscolar !== "Nocional" && nivelEscolar !== "Inicial 1" && nivelEscolar !== "Inicial 2"
        && nivelEscolar !== "Primero de básica" && nivelEscolar !== "Segundo de básica" && nivelEscolar !== "Tercero de básica"
        && nivelEscolar !== "Cuarto de básica" && nivelEscolar !== "Quinto de básica" && nivelEscolar !== "Sexto de básica"
        && nivelEscolar !== "Séptimo de básica" && nivelEscolar !== "Octavo de básica" && nivelEscolar !== "Noveno de básica"
        && nivelEscolar !== "Décimo de básica" && nivelEscolar !== "Primero de bachillerato" && nivelEscolar !== "Segundo de bachillerato"
        && nivelEscolar !== "Tercero de bachillerato"
    ){
        return res.status(400).json({ msg: "Lo sentimos, el nivel escolar debe ser Educación Inicial, Educación General Básica o Educación Media (Bachillerato)" });
    }

    //Comprobar el paralelo en el que se encuentra el estudiante
    if(paralelo !== "A" && paralelo !== "B" && paralelo !== "C" ){
        return res.status(400).json({ msg: "Lo sentimos, el paralelo debe ser de la A a la C" });
    }

    //Comprobación de que sea un link de google maps
    const carateresGoogleMaps = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+$/;
    if (!carateresGoogleMaps.test(ubicacionEstudiante)) {
        return res.status(400).json({ msg: "Lo sentimos, el link de ubicación debe ser de google maps" });
    }

    try {
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({ msg: "Conductor no encontrado" });
        }
        //Creación de un nuevo estudiante
        const nuevoEstudiante = new Estudiantes({
            nombreEstudiante,
            apellidoEstudiante,
            nivelEscolar,
            paralelo,
            numeroDeCedula,
            rutaDelEstudiante: conductor.numeroDeRutaAsignada,
            ubicacionEstudiante,
            institucionEstudiante: conductor.institucionALaQueSeRealizaElReco,
            recoCompletoOMedio, 
            conductor: conductor._id
        });

        //Se guarda en la base de datos el nuevo estudiante
        await nuevoEstudiante.save();

        // Actualizar el número de estudiantes registrados por el conductor
        conductor.numeroDeEstudiantes += 1;
        conductor.estudiantesRegistrados.push(`${nombreEstudiante} ${apellidoEstudiante} - ${nivelEscolar} ${paralelo}`);
        await conductor.save();

        res.status(201).json({ msg: "Estudiante registrado exitosamente", nuevoEstudiante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el estudiante" });
    }
}

const LoginConductor = async (req, res) => {
    // Toma de los datos del conductor que se quiere logear
    const { emailConductor, passwordConductor } = req.body;

    console.log(emailConductor, passwordConductor); 
    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Verificación de que el conductor exista
        const conductor = await Conductores.findOne({emailDelConductor : emailConductor});
        if (!conductor) {
            return res.status(404).json({ msg: "Lo sentimos, el conductor no se encuentra registrado" });
        }

        // Verificar la contraseña
        const verificarPassword = await conductor.matchPassword(passwordConductor);
        
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });
        }

        // Creación del token para el logeo del conductor
        const token = createToken({ id: conductor._id, email: conductor.emailDelConductor, role: 'conductor' });

        // Mensaje de éxito
        return res.status(200).json({ token, msg: "Bienvenido conductor" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error al autenticar el conductor" });
    }
};

const ActualizarPassword = async (req, res) => {
    // Toma de los datos del conductor que desea cambiar su contraseña
    const {passwordAnterior, passwordActual, passwordActualConfirm} = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try{
        // Verificación de la contraseña anterior
        const conductor = await Conductores.findById(req.user.id);
        const verificarPassword = await conductor.matchPassword(passwordAnterior);
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, la contraseña anterior no es la correcta" });
        }

        // Verificación de la confirmación de la contrseña actual 
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({ msg: "Lo sentimos, la contraseña nueva y su confirmación no coinciden" });
        }

        // Encriptar la contraseña antes de guardarla
        conductor.passwordParaElConductor = await conductor.encrypPassword(passwordActual);
        await conductor.save();
        res.status(201).json({ msg_actualizacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar la contraseña" });
    }

}

const RecuperacionPassword = async (req, res) => {
    //Recepción del email del conductor
    const {emailDelConductor} = req.body;

    //Verificación de que el email no se encuentre vacío
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const conductor = await Conductores.findOne({emailDelConductor});
    try{
        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({msg:"Lo sentimos, el conductor no se encuentra registrado"})
        }

        //Creación del token para la recuperación de la contraseña
        const token = conductor.crearToken();
        conductor.token = token;

        //Envío del correo de recuperación de la contraseña
        await recuperacionContrasenia(conductor.emailDelConductor, conductor.nombreConductor, conductor.apellidoConductor, token);
        await conductor.save();
        res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
    }catch(error){
        console.error(error);
        res.status(500).json({ msg_recuperacion_contrasenia:"Error al recuperar la contraseña"});
    }
}

const ComprobarTokenPassword= async (req, res) => { 
    //Recepción del token
    const tokenURL = req.params.token;

    //Verificación de que el token sea válido
    if(!tokenURL) return res.status(404).json({msg:"Lo sentimos, el token se encuentra vacío"});
    try {
        //Verificación de que exista un conductor con el token 
        const conductor = await Conductores.findOne({token: tokenURL});
        if(conductor?.token !== tokenURL ) return res.status(404).json({msg:"Lo sentimos, el token no coincide con ningún conductor"});
        await conductor.save()
        res.status(200).json({msg_recuperacion_contrasenia:"Token confirmado, ya puedes crear tu nuevo password"}) 

    } catch (error) {
        console.error(error);
        res.status(500).json({msg_recuperacion_contrasenia:"Error al comprobar el token"});
    }
}

const NuevaPassword = async (req, res) => {
    //Recepción de la nueva contraseña
    const {passwordActual, passwordActualConfirm} = req.body;
    const tokenURL = req.params.token;
    //Verificación de que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({msg: "Lo sentimos, debes llenar todos los campos"});
    }

    //Verificación de que el token sea válido
    if(!tokenURL) return res.status(404).json({msg:"Lo sentimos, el token se encuentra vacío"});
    try {
        //Verificación de que la contraseña y su confirmación coincidan
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({msg_recuperacion_contrasenia: "Lo sentimos, la contraseña nueva y su confirmación no coinciden"});
        }

        // Encriptar la contraseña antes de guardarla
        const conductor = await Conductores.findOne({token: tokenURL});
        conductor.passwordParaElConductor = await conductor.encrypPassword(passwordActual);
        conductor.token = null; 
        await conductor.save();
        res.status(201).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg_recuperacion_contrasenia:"Error al crear la nueva contraseña"});
    }
}

const ListarEstudiantes = async (req, res) => {
  
}

const BuscarEstudiante = async (req, res) => {
  
}

const ActualizarEstudiante = async (req, res) => {
  
}

const EliminarEstudiante = async (req, res) => {
  
}


export {
    RegistroDeLosEstudiantes,
    LoginConductor, 
    ActualizarPassword, 
    RecuperacionPassword, 
    ComprobarTokenPassword,
    NuevaPassword,
    ListarEstudiantes,
    BuscarEstudiante, 
    ActualizarEstudiante, 
    EliminarEstudiante
}