import Conductores from '../models/Administrador.js';
import Estudiantes from '../models/Conductor.js';
import Representantes from '../models/Representantes.js';
import {createToken} from '../middlewares/autho.js';
import {directionsService} from '../config/mapbox.js';
import {recuperacionContrasenia} from "../config/nodemailer.js"; 
import axios from 'axios';
import cloudinary from 'cloudinary';
import fs from 'fs-extra';

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
    if(!cedula || cedula.toString().length !== 10){
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

    try {
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);

        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({ msg_conductor_logeado: "Conductor no encontrado" });
        }

        //Extraer las coordenadas de la direccion del estudiante
        const coordenadas = await ExtraerCoordenadasLinkGoogleMaps(ubicacionDomicilio);
        if (coordenadas.msg_extracion_coordenadas_estudiantes) {
            return res.status(400).json({ msg_registro_estudiantes: coordenadas.msg_extracion_coordenadas_estudiantes});
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
            latitud: coordenadas.latitud,
            longitud: coordenadas.longitud,
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
   
    //Extraer las coordenadas de la direccion del estudiante
    const coordenadas = await ExtraerCoordenadasLinkGoogleMaps(ubicacionDomicilio);
    if (coordenadas.msg_extracion_coordenadas_estudiantes) return res.status(400).json({ msg_actualizar_estudiantes: coordenadas.msg_extracion_coordenadas_estudiantes });

    //Datos del estudiante 
    const {nombre, apellido, cedula} = estudiante;

    // Actualización de los datos
    await Estudiantes.findOneAndUpdate(
        { cedula },
        { nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio, latitud: coordenadas.latitud, longitud: coordenadas.longitud },
        // Esta opción devuelve el documento actualizado en lugar del original
        { new: true } 
    );

    const conductor = await Conductores.findById(req.user.id);
    
    //Actualizar el array de los estudiantes
    const estudianteAActualizar = `${cedula} - ${nombre} ${apellido} - ${nivelEscolar} ${paralelo}`;
    conductor.estudiantesRegistrados = conductor.estudiantesRegistrados.map(estudiante => {
        const [cedulaEstudiante] = estudiante.split(" - ");
        return cedulaEstudiante === cedula ? estudianteAActualizar : estudiante;
    });
    await conductor.save();

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

    //Extraer las coordenadas de la direccion del estudiante
    const coordenadas = await ExtraerCoordenadasLinkGoogleMaps(ubicacionDomicilio);
    if (coordenadas.msg_extracion_coordenadas_estudiantes) return res.status(400).json({ msg_actualizar_estudiantes: coordenadas.msg_extracion_coordenadas_estudiantes });

    //Datos del estudiante 
    const {nombre, apellido} = estudiante;

    // Actualización de los datos
    await Estudiantes.findOneAndUpdate(
        { cedula },
        { nivelEscolar, paralelo, ubicacionDomicilio, recoCompletoOMedio, latitud: coordenadas.latitud, longitud: coordenadas.longitud },
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
    const {nombre, apellido, cedula, nivelEscolar, paralelo} = estudiante;

    //Eliminación del conductor
    await Estudiantes.findOneAndDelete({id});
    const conductor = await Conductores.findById(req.user.id);
    //Eliminación en el array de los conductores
    conductor.numeroEstudiantes -= 1;
    const estudianteAEliminar = `${cedula} - ${nombre} ${apellido} - ${nivelEscolar} ${paralelo}`;
    conductor.estudiantesRegistrados = conductor.estudiantesRegistrados.filter(estudiante => estudiante !== estudianteAEliminar);
    await conductor.save();

    //Mensaje de exito
    res.status(200).json({msg_eliminacion_estudiante:`Los datos del estudiante ${nombre} ${apellido} han eliminado exitosamente`})
}

//Funciones para el manejo de ubicaciones 

//Función que extrae la latitud y longitud de la ubicacion del estudiante
const ExtraerCoordenadasLinkGoogleMaps = async (url) => {
    try {
        // Realizar una solicitud GET para resolver el enlace
        const response = await axios.get(url, { 
            maxRedirects: 0, 
            validateStatus: status => (status >= 200 && status < 400) || status === 302 
        });
        const fullUrl = response.headers.location || url;

        if (!fullUrl) {
            return { msg_extracion_coordenadas_estudiantes: "No se pudo resolver el enlace corto" };
        }

        console.log(`Resolved URL: ${fullUrl}`);

        // Expresión regular para extraer coordenadas de enlaces largos
        const regexCoordinatesLong = /search\/(-?\d+\.\d+),\+?\s*(-?\d+\.\d+)/;
        // Expresión regular para extraer coordenadas de enlaces cortos
        const regexCoordinatesShort = /@(-?\d+\.\d+),\+?\s*(-?\d+\.\d+)/;

        // Intentar extraer coordenadas
        let match = fullUrl.match(regexCoordinatesLong);
        if (!match) {
            match = fullUrl.match(regexCoordinatesShort);
        }
        console.log(`Regex Match Result: ${match}`);

        if (match) {
            return {
                latitud: parseFloat(match[1]),
                longitud: parseFloat(match[2])
            };
        }

        // Mensaje de error si no se encuentran las coordenadas
        return { msg_extracion_coordenadas_estudiantes: "Lo sentimos, no se ha podido extraer la ubicación" };
    } catch (error) {
        console.error(error);
        return { msg_extracion_coordenadas_estudiantes: "Error al resolver el enlace de Google Maps" };
    }
};

//Funcion para calcular la distancia y el tiempo entre dos ubicaciones
const CalcularDistanciaYTiempo = async (latitudOrigen, longitudOrigen, latitudDestino, longitudDestino) => {
    try {
        // Las coordenadas deben ser números
        const latOrigen = parseFloat(latitudOrigen);
        const lonOrigen = parseFloat(longitudOrigen);
        const latDestino = parseFloat(latitudDestino);
        const lonDestino = parseFloat(longitudDestino);

        console.log("Destino: ", latDestino, lonDestino);
        console.log("Origen", latOrigen, lonOrigen);

        // Verificar que las coordenadas sean válidas
        if (isNaN(latOrigen) || isNaN(lonOrigen) || isNaN(latDestino) || isNaN(lonDestino)) {
            return { msg_calculo_distancia_tiempo: "Error al calcular la distancia y el tiempo" };
        }

        const respuesta = await directionsService.getDirections({
            profile: 'driving-traffic',
            waypoints: [
                // Coordenadas de origen
                { coordinates: [lonOrigen, latOrigen] },
                // Coordenadas de destino
                { coordinates: [lonDestino, latDestino] }
            ],
        }).send();

        console.log(respuesta.body);
        // Extraer la información de la distancia y el tiempo
        // Conversión de metros a kilómetros
        const distancia = parseFloat(respuesta.body.routes[0].distance / 1000);
        // Conversión de segundos a minutos
        const tiempo =  parseFloat(respuesta.body.routes[0].duration / 60);

        // Retorno de la distancia y el tiempo
        return { distancia, tiempo };
    } catch (error) {
        console.error(error);
        return { msg_calculo_distancia_tiempo: "Error al calcular la distancia y el tiempo" };
    }
}

// Función para enviar notificaciones a los padres de familia
const EnviarNotificacion = async (conductorId, estudianteNombre, representanteId, distancia, tiempo) => {
    try {
        // Usar lean() para obtener un objeto simple
        const representante = await Representantes.findById(representanteId).lean(); 
        // Verificar si el representante existe
        if (!representante) return { msg_notificacion: "Representante no encontrado" };
        // Usar updateOne para actualizar un documento
        await Representantes.updateOne({ _id: representanteId }, { notificacionEnviada: true });
        // Enviar la notificación al representante
        return { msg_notificacion: `Notificación enviada al representante ${representante.nombre} del estudiante ${estudianteNombre} del conductor ${conductorId}` };
    } catch (error) {
        console.error(error);
        return { msg_notificacion: "Error al enviar la notificación" };
    }
}

const ManejoActualizacionUbicacion = async (req, res) => {
    const {latitud, longitud } = req.body;
    const {id} = req.user;
    try {
        // Usar lean() para obtener un objeto simple
        const conductor = await Conductores.findById(id).lean(); 
        if (!conductor) {
            return res.json({ msg_actualizacion_ubicacion: "Conductor no encontrado" });
        }
        // Usar updateOne en lugar de save
        await Conductores.updateOne({ _id: id }, { latitud, longitud }); 
        // Usar lean() para obtener objetos simples
        const estudiantes = await Estudiantes.find({ conductor: id }).lean(); 
        // Crear un array para almacenar las notificaciones
        const notificaciones = [];

        for (const estudiante of estudiantes) {
            // Extraer las coordenadas del estudiante
            const { latitud: latitudEstudiante, longitud: longitudEstudiante, cedula } = estudiante;
            // Calcular la distancia y el tiempo entre el conductor y el estudiante
            const { distancia, tiempo } = await CalcularDistanciaYTiempo( latitud, longitud, latitudEstudiante, longitudEstudiante);
            if (distancia <= 1) {
                // Usar lean() para obtener objetos simples
                const representantes = await Representantes.find({ cedulaRepresentado: cedula }).lean(); 
                for (const representante of representantes) {
                    const notificacion = await EnviarNotificacion(id, estudiante.nombre, representante._id, distancia, tiempo);
                    notificaciones.push(notificacion);
                }
            }
        }
        return res.status(200).json({ msg_actualizacion_ubicacion: "Ubicación actualizada correctamente", notificaciones });
    } catch (error) {
        console.error(error);
        return res.status(200).json({ msg_actualizacion_ubicacion: "Error al actualizar la ubicación" });
    }
}

const VisuallizarPerfil = async (req, res) => {
    try {
        // Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id).select("-password -createdAt -updatedAt -__v");
        // Verificación de la existencia del conductor
        if (!conductor) return res.status(404).json({ msg: "Conductor no encontrado" });
        //Si se encuentra el conductor se envía su información
        res.status(200).json(conductor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al visualizar el perfil del conductor" });
    }
}

const ActualizarPerfil = async (req, res) => {
    //Obtención de datos de lo escrito por el conductor
    const {placaAutomovil, telefono} = req.body;
    const {id} = req.user;
    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });
    try{
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra registrado" });
        // Comprobar si el telefono ya está registrado
        const verificarTelefonoBDD = await Conductores.findOne({telefono});
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado" })
        };
        
        // Comprobar si la placa ya está registrada
        const verificarPlacaBDD = await Conductores.findOne({placaAutomovil});
        if (verificarPlacaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la placa ya se encuentra registrada" })
        };
        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;
        try {
            // Subir la imagen a Cloudinary con el nombre del conductor como public_id
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                public_id: `conductores/${conductor.nombre} ${conductor.apellido}`,
                folder: "conductores"
            });
            // Guardar la URL de la imagen en la base de datos
            conductor.fotografiaDelConductor = result.secure_url;
            // Eliminar el archivo local después de subirlo
            await fs.unlink(file.tempFilePath);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg_registro_conductor: "Error al subir la imagen" });
        }
        } else {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debes subir una imagen" });
        }
        // Actualización de los datos
        conductor.placaAutomovil = placaAutomovil;
        conductor.telefono = telefono;
        await conductor.save();
        res.status(200).json({ msg_actualizacion_perfil: "Los datos del conductor han sido actualizados exitosamente" });
    } catch(error){
        console.error(error);
        res.status(500).json({msg_actualizacion_perfil:"Error al actualizar el perfil del conductor"});
    }
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
    EliminarEstudiante, 
    ManejoActualizacionUbicacion, 
    VisuallizarPerfil, 
    ActualizarPerfil
}