import Conductores from '../models/Administrador.js';
import {createToken} from '../middlewares/autho.js';
import Estudiantes from '../models/Conductor.js';
import {recuperacionContrasenia} from "../config/nodemailer.js"; 

//Registro de los estudiantes
const RegistroDeLosEstudiantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        nivelEscolar,
        paralelo,
        cedula,
        ubicacionDomicilio,
        recoCompletoOMedio
    } = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, debes llenar todos los campos" });
    }

    // Comprobar el tamaño de la cedula
    if(cedula.toString().length !== 10){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el número de cédula debe tener 10 dígitos" });
    }

    //Comprobar que el nivel escolar se encuentre bien escrito 
    if(nivelEscolar !== "Nocional" && nivelEscolar !== "Inicial 1" && nivelEscolar !== "Inicial 2"
        && nivelEscolar !== "Primero de básica" && nivelEscolar !== "Segundo de básica" && nivelEscolar !== "Tercero de básica"
        && nivelEscolar !== "Cuarto de básica" && nivelEscolar !== "Quinto de básica" && nivelEscolar !== "Sexto de básica"
        && nivelEscolar !== "Séptimo de básica" && nivelEscolar !== "Octavo de básica" && nivelEscolar !== "Noveno de básica"
        && nivelEscolar !== "Décimo de básica" && nivelEscolar !== "Primero de bachillerato" && nivelEscolar !== "Segundo de bachillerato"
        && nivelEscolar !== "Tercero de bachillerato"
    ){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el nivel escolar debe ser Educación Inicial, Educación General Básica o Educación Media (Bachillerato)" });
    }

    //Comprobar el paralelo en el que se encuentra el estudiante
    if(paralelo !== "A" && paralelo !== "B" && paralelo !== "C" ){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el paralelo debe ser de la A a la C" });
    }

    //Comprobación de que sea un link de google maps
    const carateresGoogleMaps = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+$/;
    if (!carateresGoogleMaps.test(ubicacionDomicilio)) {
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el link de ubicación debe ser de google maps" });
    }

    try {
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({ msg_conductor_logeado: "Conductor no encontrado" });
        }
        //Creación de un nuevo estudiante
        const nuevoEstudiante = new Estudiantes({
            nombre,
            apellido,
            nivelEscolar,
            paralelo,
            cedula,
            ruta: conductor.rutaAsignada,
            ubicacionDomicilio,
            institucion: conductor.institucion,
            recoCompletoOMedio, 
            conductor: conductor._id
        });

        //Se guarda en la base de datos el nuevo estudiante
        await nuevoEstudiante.save();

        // Actualizar el número de estudiantes registrados por el conductor
        conductor.numeroEstudiantes += 1;
        conductor.estudiantesRegistrados.push(`${cedula} - ${nombre} ${apellido} - ${nivelEscolar} ${paralelo}`);
        await conductor.save();

        res.status(201).json({ msg_registro_estudiantes: "Estudiante registrado exitosamente", nuevoEstudiante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_registro_estudiantes: "Error al registrar el estudiante" });
    }
}

const LoginConductor = async (req, res) => {
    // Toma de los datos del conductor que se quiere logear
    const {email, password} = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg_login_conductor: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Verificación de que el conductor exista
        const conductor = await Conductores.findOne({email : email});
        if (!conductor) {
            return res.status(404).json({ msg_login_conductor: "Lo sentimos, el conductor no se encuentra registrado" });
        }

        // Verificar la contraseña
        const verificarPassword = await conductor.matchPassword(password);
        
        if (!verificarPassword) {
            return res.status(404).json({ msg_login_conductor: "Lo sentimos, el password no es el correcto" });
        }

        // Creación del token para el logeo del conductor
        const token = createToken({ id: conductor._id, email: conductor.email, role: 'conductor' });

        // Mensaje de éxito
        return res.status(200).json({ token, msg_login_conductor: "Bienvenido conductor" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg_login_conductor: "Error al autenticar el conductor" });
    }
};

const ActualizarPassword = async (req, res) => {
    // Toma de los datos del conductor que desea cambiar su contraseña
    const {passwordAnterior, passwordActual, passwordActualConfirm} = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg_actualizacion_contrasenia: "Lo sentimos, debes llenar todos los campos" });
    }

    try{
        // Verificación de la contraseña anterior
        const conductor = await Conductores.findById(req.user.id);
        const verificarPassword = await conductor.matchPassword(passwordAnterior);
        if (!verificarPassword) {
            return res.status(404).json({ msg_actualizacion_contrasenia: "Lo sentimos, la contraseña anterior no es la correcta" });
        }

        // Verificación de la confirmación de la contrseña actual 
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({ msg: "Lo sentimos, la contraseña nueva y su confirmación no coinciden" });
        }

        // Encriptar la contraseña antes de guardarla
        conductor.password = await conductor.encrypPassword(passwordActual);
        await conductor.save();
        res.status(201).json({ msg_actualizacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_contrasenia: "Error al actualizar la contraseña" });
    }

}

const RecuperacionPassword = async (req, res) => {
    //Recepción del email del conductor
    const {email} = req.body;

    //Verificación de que el email no se encuentre vacío
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const conductor = await Conductores.findOne({email: email});
    try{
        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({msg:"Lo sentimos, el conductor no se encuentra registrado"})
        }

        //Creación del token para la recuperación de la contraseña
        const token = conductor.crearToken();
        conductor.token = token;

        //Envío del correo de recuperación de la contraseña
        await recuperacionContrasenia(conductor.email, conductor.nombre, conductor.apellido, token);
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
    if(!tokenURL) return res.status(404).json({msg_recuperacion_contrasenia:"Lo sentimos, el token se encuentra vacío"});
    try {
        //Verificación de que exista un conductor con el token 
        const conductor = await Conductores.findOne({token: tokenURL});
        if(conductor?.token !== tokenURL ) return res.status(404).json({msg_recuperacion_contrasenia:"Lo sentimos, el token no coincide con ningún conductor"});
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
        return res.status(400).json({msg_recuperacion_contrasenia: "Lo sentimos, debes llenar todos los campos"});
    }

    //Verificación de que el token sea válido
    if(!tokenURL) return res.status(404).json({msg_recuperacion_contrasenia:"Lo sentimos, el token se encuentra vacío"});
    try {
        //Verificación de que la contraseña y su confirmación coincidan
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({msg_recuperacion_contrasenia: "Lo sentimos, la contraseña nueva y su confirmación no coinciden"});
        }

        // Encriptar la contraseña antes de guardarla
        const conductor = await Conductores.findOne({token: tokenURL});
        conductor.password = await conductor.encrypPassword(passwordActual);
        conductor.token = null;
        await conductor.save();
        res.status(201).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg_recuperacion_contrasenia:"Error al crear la nueva contraseña"});
    }
}

const ListarEstudiantes = async (req, res) => {
    try{
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        //Enlistar los estudiantes de la ruta del conductor logeado
        const estudiantes = await Estudiantes.find({ruta: conductor.rutaAsignada}).where('conductor').equals(conductor._id).select("-createdAt -updatedAt -__v").populate('conductor','_id nombre apellido')
        res.status(200).json(estudiantes);
    } catch (error) {
        console.error(error);
        res.status(500).json({msg_lista_estudiantes:"Error al listar los estudiantes"});
    }
}

const BuscarEstudiante = async (req, res) => {
     //Obtener el id de los parámetros de la URL
    const {id} = req.params;
    //Información del conductor logeado
    const conductor = await Conductores.findById(req.user.id);
    // Verificación de la existencia del conductor
    const estudiante = await Estudiantes.findOne({_id:id, ruta: conductor.rutaAsignada} ).select("-updatedAt -createdAt -__v");
    if (!estudiante) return res.status(400).json({ msg_estudiante_id: "Lo sentimos, el estudiante no se ha encontrado o no pertenece a su ruta" });
    
    //Mensaje de exito
    res.status(200).json({ msg_estudiante_id: `El estudiante ${estudiante.nombre} ${estudiante.apellido} se ha encontrado exitosamente`, estudiante});
}

const BuscarEstudianteCedula = async (req, res) => {
   try {
        // Obtener el número de la cedula de los parámetros de la URL
        const {cedula} = req.params;
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        // Verificación de la existencia de la ruta
        const estudiante = await Estudiantes.findOne({cedula: cedula, ruta: conductor.rutaAsignada}).select("-updatedAt -createdAt -__v");
        if (!estudiante) return res.status(400).json({ msg: "Lo sentimos, no se ha encontrado ningun estudiante con ese numero de cedula o no pertenece a su ruta" });
   
        // Mensaje de éxito
        res.status(200).json({ msg: `El estudiante de la cedula ${cedula} se han encontrado exitosamente`, estudiante });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "Error al buscar el estudiante por su cedula", error: error.message });
    }
}


const ActualizarEstudiante = async (req, res) => {
    //Obtención de datos de lo escrito por el conductor
    const {nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio} = req.body;
    //Obtención del id del estudiante (facilitado en la URL)
    const {id} = req.params;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizar_estudiantes: "Lo sentimos, debes llenar todos los campos" });

    // Verificación de la existencia del conductor
    const estudiante = await Estudiantes.findOne({_id:id});
    if (!estudiante) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

     //Comprobación de que sea un link de google maps
    const carateresGoogleMaps = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+$/;
    if (!carateresGoogleMaps.test(ubicacionDomicilio)) {
        return res.status(400).json({ msg_actualizar_estudiantes: "Lo sentimos, el link de ubicación debe ser de google maps" });
    }
   
    //Datos del estudiante 
    const {nombre, apellido} = estudiante;

    // Actualización de los datos
    await Estudiantes.findOneAndUpdate(
        { _id: id },
        { nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio },
        // Esta opción devuelve el documento actualizado en lugar del original
        { new: true } 
    );

    res.status(200).json({
        msg_actualizar_estudiantes: `Los datos del estudiante ${nombre} ${apellido} han sido actualizados exitosamente`
    });
}
const ActualizarEstudianteCedula = async (req, res) => {
    //Obtención de datos de lo escrito por el conductor
    const {nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio} = req.body;
    //Obtención del id del estudiante (facilitado en la URL)
    const {cedula} = req.params;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_estudiante_cedula: "Lo sentimos, debes llenar todos los campos" });

    // Verificación de la existencia del conductor
    const estudiante = await Estudiantes.findOne({ cedula: cedula });
    if (!estudiante) return res.status(400).json({ msg_actualizacion_estudiante_cedula: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    //Datos del estudiante 
    const {nombre, apellido} = estudiante;

    // Actualización de los datos
    await Estudiantes.findOneAndUpdate(
        { cedula },
        { nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio},
        // Esta opción devuelve el documento actualizado en lugar del original
        { new: true } 
    );

    res.status(200).json({
        msg: `Los datos del estudiante ${nombre} ${apellido} han sido actualizados exitosamente`
    });
}

const EliminarEstudiante = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const { id } = req.params;
        
    //Verificación de la existencia del conductor
    const estudiante = await Estudiantes.findOne({_id:id});
    if(!estudiante) return res.status(400).json({msg_eliminacion_estudiante:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
    
    //Datos del estudiante 
    const {nombre, apellido} = estudiante;

    //Eliminación del conductor
    await Estudiantes.findOneAndDelete({id});
    const conductor = await Conductores.findById(req.user.id);
    //Eliminación en el array de los conductores
    conductor.estudiantesRegistrados = conductor.estudiantesRegistrados.filter(estudiante => estudiante !== `${cedula} - ${nombre} ${apellido} - ${nivelEscolar} ${paralelo}`);

    //Mensaje de exito
    res.status(200).json({msg_eliminacion_estudiante:`Los datos del estudiante ${nombre} ${apellido} han eliminado exitosamente`})
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
    BuscarEstudianteCedula,
    ActualizarEstudiante, 
    ActualizarEstudianteCedula,
    EliminarEstudiante
}