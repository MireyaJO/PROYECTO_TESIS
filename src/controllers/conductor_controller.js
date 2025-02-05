import Conductores from '../models/Administrador.js';
import Estudiantes from '../models/Conductor.js';
import Representantes from '../models/Representantes.js';
import AsistenciasTarde from '../models/AsistenciasTarde.js';
import Notificaciones from '../models/Notificaciones.js';
import NotificacionesEliminacionEstudiantes from '../models/NotificacionEliminacion.js';
import {createToken} from '../middlewares/autho.js';
import {directionsService} from '../config/mapbox.js';
import {confirmacionDeCorreoConductorCambio, eliminacionDelRepresentante} from "../config/nodemailer.js"; 
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
        genero,
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

    //Comprobación de lo escrito en el genero del estudiante 
    if(genero!== "Femenino" && genero !== "Masculino" && genero !== "Prefiero no decirlo"){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el género debe ser Femenino, Masculino o Prefiero no decirlo" });
    }

    try {
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);

        //Verificación de que el conductor exista
        if(!conductor){
            return res.status(404).json({ msg_conductor_logeado: "Conductor no encontrado" });
        }

        // Inicializar el array de estudiantes registrados si no está definido
        if (!conductor.estudiantesRegistrados) {
            conductor.estudiantesRegistrados = [];
        }

        const cedulaExistente = await Estudiantes.findOne({ cedula });
        if (cedulaExistente) {
            return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, la cédula ya está registrada" });
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
            genero,
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

        // Actualizar el array de los estudiantes
        const estudianteRegistrado = {idEstudiante: nuevoEstudiante._id, nombreEstudiante: nuevoEstudiante.nombre, apellidoEstudiante: nuevoEstudiante.apellido, nivelEscolarEstudiante: nuevoEstudiante.nivelEscolar, paraleloEstudiante: nuevoEstudiante.paralelo, cedulaEstudiante: nuevoEstudiante.cedula}     
        conductor.ingresarEstudiante(estudianteRegistrado)

        // Guardar los cambios en la base de datos
        await conductor.save();

        res.status(200).json({ msg_registro_estudiantes: "Estudiante registrado exitosamente", nuevoEstudiante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_registro_estudiantes: "Error al registrar el estudiante", error: error.message });
    }
}

//Cambio de contraseña del conductor una vez logeado el mismo 
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
            return res.status(400).json({ msg_actualizacion_contrasenia: "Lo sentimos, la contraseña anterior no es la correcta" });
        }

        // Verificación de la confirmación de la contrseña actual 
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({ msg: "Lo sentimos, la contraseña nueva y su confirmación no coinciden" });
        }

        // Encriptar la contraseña antes de guardarla
        conductor.password = await conductor.encrypPassword(passwordActual);
        await conductor.save();
        res.status(200).json({ msg_actualizacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_contrasenia: "Error al actualizar la contraseña" });
    }

}

//Todos los estudiantes de la ruta del conductor logeado
const ListarEstudiantes = async (req, res) => {
    try{
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        //Enlistar los estudiantes de la ruta del conductor logeado
        const estudiantes = await Estudiantes.find({ruta: conductor.rutaAsignada}).where('conductor').equals(conductor._id).select("-createdAt -updatedAt -__v").populate('conductor','_id nombre apellido')
        res.status(200).json({msg_lista_estudiantes:`Los estudiantes registrados del conductor ${conductor.nombre} ${conductor.apellido}`, estudiantes});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg_lista_estudiantes:"Error al listar los estudiantes"});
    }
}

//Buscar un estudiante por su cedula
const BuscarEstudianteCedula = async (req, res) => {
   try {
        // Obtener el número de la cedula de los parámetros de la URL
        const {cedula} = req.params;
        //Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id);
        // Verificación de la existencia de la ruta
        const estudiante = await Estudiantes.findOne({cedula: cedula, conductor: conductor._id}).select("-updatedAt -createdAt -__v");
        if (!estudiante) return res.status(404).json({ msg_busqueda_estudiante: "Lo sentimos, no se ha encontrado ningun estudiante con ese numero de cedula o no pertenece a su ruta" });
   
        // Mensaje de éxito
        res.status(200).json({ msg_busqueda_estudiante: `El estudiante de la cedula ${cedula} se han encontrado exitosamente`, estudiante });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg_busqueda_estudiante: "Error al buscar el estudiante por su cedula", error: error.message });
    }
}

//Actualizar los datos de un estudiante
const ActualizarEstudiante = async (req, res) => {
    //Obtención de datos de lo escrito por el conductor
    const { 
        nombre,
        apellido,
        nivelEscolar,
        genero,
        paralelo,
        cedula,
        ubicacionDomicilio,
        recoCompletoOMedio
    } = req.body;
    //Obtención del id del estudiante (facilitado en la URL)
    const {id} = req.params;
    //Información del conductor logeado
    const conductor = await Conductores.findById(req.user.id); 

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizar_estudiantes: "Lo sentimos, debes llenar todos los campos" });

    //Comprobar que la cedula sea unica 
    const cedulaExistente = await Estudiantes.findOne({cedula: cedula, conductor: conductor._id});
    if(cedulaExistente && cedulaExistente._id.toString() !== id){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, la cédula ya se encuentra registrada" });
    }

    // Verificación de la existencia del estudiante
    const estudiante = await Estudiantes.findOne({_id:id, conductor: conductor._id});
    if (!estudiante) return res.status(400).json({ msg: "Lo sentimos, el estudiante no se encuentra o no pertenece a la ruta" });

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

    //Comprobación de lo escrito en el genero del estudiante 
    if(genero!== "Femenino" && genero !== "Masculino" && genero !== "Prefiero no decirlo"){
        return res.status(400).json({ msg_registro_estudiantes: "Lo sentimos, el género debe ser Femenino, Masculino o Prefiero no decirlo" });
    }
   
    //Extraer las coordenadas de la direccion del estudiante
    const coordenadas = await ExtraerCoordenadasLinkGoogleMaps(ubicacionDomicilio);
    if (coordenadas.msg_extracion_coordenadas_estudiantes) return res.status(400).json({ msg_actualizar_estudiantes: coordenadas.msg_extracion_coordenadas_estudiantes });

    // Actualización de los datos del estudiante
    const estudianteActualizado = await Estudiantes.findByIdAndUpdate(
        id,
        {
            nivelEscolar,
            paralelo,
            ubicacionDomicilio,
            recoCompletoOMedio,
            latitud: coordenadas.latitud,
            longitud: coordenadas.longitud,
            nombre,
            apellido,
            genero,
            cedula
        },
        // Esta opción devuelve el documento actualizado en lugar del original
        { new: true }
    );

    // Actualización en el array del conductor
    const estudianteParaListado = {nombreEstudiante: estudianteActualizado.nombre, apellidoEstudiante: estudianteActualizado.apellido, nivelEscolarEstudiante: estudianteActualizado.nivelEscolar, paraleloEstudiante: estudianteActualizado.paralelo, cedulaEstudiante: estudianteActualizado.cedula}
    const actualizar = await conductor.actualizarListaEstudiantes(estudianteParaListado, estudianteActualizado._id);
    if (actualizar?.error) return res.status(400).json({ msg_actualizar_estudiantes: actualizar.error });
    await conductor.save();

    res.status(200).json({
        msg_actualizar_estudiantes: `Los datos del estudiante ${estudiante.nombre} ${estudiante.apellido} han sido actualizados exitosamente`
    });
}

// Función para enviar notificaciones a los padres de familia
const EnviarNotificacionEliminacion= async (conductorId, representanteId, nombresRepresentante, apellidosRepresentante, mensaje ) => {
    try {
        //Creación de una nueva notificacion de eliminación
        const nuevaNotificacion = new NotificacionesEliminacionEstudiantes({
            conductor: conductorId,
            representante: representanteId,
            mensaje: mensaje, 
            fecha: new Date().toISOString().split('T')[0]
        });

        //Guardar  cambios en la base de datos
        await nuevaNotificacion.save();

        //Enviar la notificacion al representante
        return { msg_notificacion: `Notificación enviada exitosamente al representante ${nombresRepresentante} ${apellidosRepresentante}` };
    } catch (error) {
        return { msg_notificacion: "Error al enviar la notificación de eliminacion" };
    }
}

//Eliminación de un estudiante registrado por el conductor logeado
const EliminarEstudiante = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const { id } = req.params;
    //Información del conductor logeado
    const conductor = await Conductores.findById(req.user.id)
        
    //Verificación de la existencia del conductor
    const estudiante = await Estudiantes.findOne({_id:id, conductor: conductor._id});
    if(!estudiante) return res.status(404).json({msg_eliminacion_estudiante:"Lo sentimos, el estudiante no se encuentra o no pertenece a la ruta"});
    
    //Datos del estudiante 
    const {nombre, apellido, cedula} = estudiante;

    //Eliminacion de la cedula del estudiante en el array del representante
    const representantes = await Representantes.find({ cedulaRepresentado: cedula });

    // Variable para almacenar el mensaje de advertencia
    let advertencia = ''; 
    if (representantes.length > 0) {
        //Recorrer los representados para eliminar la cedula del estudiante en cada uno de los vinculados al mismo
        for (const representante of representantes) {
            await representante.eliminarEstudiante(cedula);
    
            //Verificar si el array de los estudiantes del representante se encuentra vacío
            if(representante.cedulaRepresentado.length === 0){
                //Eliminación del representante
                await Representantes.findOneAndDelete({_id: representante._id});
                advertencia = `El representante ${representante.nombre} ${representante.apellido} ha sido eliminado ya que no tiene estudiantes registrados, se le envió un correo`;
                await eliminacionDelRepresentante(representante.email, representante.nombre, representante.apellido, nombre, apellido);
                Representantes.updateOne({ _id: representante._id }, { notificacionEliminacion: true });
            } else if (representante.cedulaRepresentado.length > 0 ){
                advertencia = `El estudiante ${nombre} ${apellido} ha sido eliminado del representante ${representante.nombre} ${representante.apellido}`;
                await EnviarNotificacionEliminacion(conductor._id, representante._id, representante.nombre, representante.apellido, advertencia);
                Representantes.updateOne({ _id: representante._id }, { notificacionEliminacion: true });
            }
        }
    } else {
        advertencia = "Se elimino el estudiante pero no se encontraron representantes asociados";
    }

    //Eliminación del estudiante
    await Estudiantes.findOneAndDelete({_id:id});
    
    //Actualización en el numero de estudiantes registrados por el conductor
    conductor.numeroEstudiantes -= 1;
    //Actualización del array de los estudiantes
    conductor.eliminarEstudiante(id);
    await conductor.save();

    //Mensaje de exito
    res.status(200).json({
        msg_eliminacion_estudiante:`Los datos del estudiante ${nombre} ${apellido} han eliminado exitosamente`, 
        msg_eliminacion_representante: advertencia
    });
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
        const distancia = parseFloat(respuesta.body.routes[0].distance / 1000).toFixed(2);
        // Conversión de segundos a minutos
        const tiempo =  parseFloat(respuesta.body.routes[0].duration / 60).toFixed(2);

        // Retorno de la distancia y el tiempo
        return { distancia, tiempo };
    } catch (error) {
        console.error(error);
        return { msg_calculo_distancia_tiempo: "Error al calcular la distancia y el tiempo" };
    }
}

const ManejoActualizacionUbicacion = async (req, res) => {
    const {latitud, longitud } = req.body;
    const {id} = req.user;
    try {
        // Usar lean() para obtener un objeto simple
        const conductor = await Conductores.findById(id); 
        if (!conductor) {
            return res.status(404).json({ msg_actualizacion_ubicacion: "Conductor no encontrado" });
        }
        
        // Actualizar la latitud y longitud del conductor
        conductor.latitud = latitud;
        conductor.longitud = longitud;
        await conductor.save(); 

        return res.status(200).json({ msg_actualizacion_ubicacion: "Ubicación actualizada correctamente"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg_actualizacion_ubicacion: "Error al actualizar la ubicación" });
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
    const {placaAutomovil, telefono, email} = req.body;
    //Obtención del id del conductor logeado
    const {id} = req.user;
    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });
    try{
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) return res.status(404).json({ msg: "Lo sentimos, el conductor no se encuentra registrado" });
        // Comprobar si el telefono ya está registrado
        const verificarTelefonoBDD = await Conductores.findOne({telefono, _id: { $ne: id } });
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el telefono ya se encuentra registrado" })
        };
        
        // Comprobar si la placa ya está registrada
        const verificarPlacaBDD = await Conductores.findOne({placaAutomovil, _id: { $ne: id } });
        if (verificarPlacaBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, la placa ya se encuentra registrada" })
        };

        //Verificar si el email ya está registrado
        const verificarEmailBDD = await Conductores.findOne({email, _id: { $ne: id } });
        const verificacionRepresentante = await Representantes.findOne({email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        }
        if (verificacionRepresentante){
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como representante" });
        }

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;
            try {
                // Definir el public_id para Cloudinary
                const publicId = `conductores/${conductor.nombre}_${conductor.apellido}`;

                // Eliminar la imagen anterior en Cloudinary
                await cloudinary.v2.uploader.destroy(publicId);

                // Subir la imagen a Cloudinary con el nombre del conductor como public_id
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                    public_id: publicId,
                    folder: "conductores", 
                    overwrite: true
                });
                // Guardar la URL de la imagen en la base de datos
                conductor.fotografiaDelConductor = result.secure_url;
                // Eliminar el archivo local después de subirlo
                await fs.unlink(file.tempFilePath);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_actualizacion_perfil: "Error al subir la imagen" });
            }
        } else {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes subir una imagen" });
        }

        // Si el email cambia, enviar un enlace de confirmación al nuevo correo
        if (email && email !== conductor.email) {
            // Crear un token JWT con el ID del conductor y el nuevo email
            const token = conductor.crearToken();
            conductor.token = token;
            conductor.tokenEmail = email;

            // Guardar el token en la base de datos
            await conductor.save();

            // Enviar un email de confirmación al nuevo correo electrónico
            await confirmacionDeCorreoConductorCambio(email, conductor.nombre, conductor.apellido, token);

            // Enviar una respuesta al cliente indicando que se ha enviado un enlace de confirmación
            return res.status(200).json({ msg: "Se ha enviado un enlace de confirmación al nuevo correo electrónico" });
        }

        // Actualización de los datos
        conductor.placaAutomovil = placaAutomovil;
        conductor.telefono = telefono;

        // Guardar los cambios en la base de datos
        await conductor.save();
        res.status(200).json({ msg_actualizacion_perfil: "Los datos del conductor han sido actualizados exitosamente" });
    } catch(error){
        console.error(error);
        res.status(500).json({msg_actualizacion_perfil:"Error al actualizar el perfil del conductor"});
    }
}

// Función para enviar notificaciones a los padres de familia
const EnviarNotificacionAsistencia = async (conductorId, estudianteNombre, representanteId, asistio) => {
    try {
        // Usar lean() para obtener un objeto simple
        const representante = await Representantes.findById(representanteId).lean(); 
        // Verificar si el representante existe
        if (!representante) return { msg_notificacion: "Representante no encontrado" };
        // Usar updateOne para actualizar un documento
        await Representantes.updateOne({ _id: representanteId }, { notificacionAsistencia: true });
        // Obtener la información del conductor
        const conductor = await Conductores.findById(conductorId).lean();
        if (!conductor) return { msg_notificacion: "Conductor no encontrado" };

        let mensaje; 
        // Verificar si el estudiante asistió
        if(asistio === true){
            mensaje = `El estudiante ${estudianteNombre} ha asistido en la tarde.`;
        }else{
            mensaje = `El estudiante ${estudianteNombre} no ha asistido en la tarde.`;
        }

        // Obtener la fecha actual
        const fechaDeHoy = new Date().toISOString().split('T')[0];

        // Crear una nueva notificación
        const nuevaNotificacion = new Notificaciones({
            conductor: conductorId,
            representante: representanteId,
            mensaje: mensaje,
            fecha: fechaDeHoy
        });

        // Guardar la notificación en la base de datos
        await nuevaNotificacion.save();
        
        // Enviar la notificación al representante
        return { msg_notificacion: `Notificación enviada al representante ${representante.nombre} del estudiante ${estudianteNombre} del conductor ${conductor.nombre} ${conductor.apellido}` };
    } catch (error) {
        console.error(error);
        return { msg_notificacion: "Error al enviar la notificación" };
    }
}

// Tomar lista en la tarde
const TomarListaTarde = async (req, res) => {
    // ID del conductor logeado
    const { id } = req.user; 
    // Recepción de los datos de la lista
    const { estudiantes } = req.body;

    try {
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        // Si no se encuentra el conductor
        if (!conductor) {
            return res.status(404).json({ msg: "Conductor no encontrado" });
        }
        // Verificación de los campos vacíos
        if (!estudiantes || estudiantes.length === 0) {
            return res.status(400).json({ msg: "La lista de estudiantes no puede estar vacía" });
        }
        // Obtener la fecha actual
        const fechaDeHoy = new Date().toISOString().split('T')[0];

        // Verificar si ya existe un registro de asistencia para el conductor en la fecha actual
        const asistenciaExistente = await AsistenciasTarde.findOne({ conductor: id, fecha: fechaDeHoy });
        if (asistenciaExistente) {
            return res.status(400).json({ msg: "La lista ya ha sido tomada para el día de hoy" });
        }
        
        //Verificar si los ids de los estudiantes se encuentran vinculados al conductor
        for (const estudiante of estudiantes) {
            //Encuentra un documento con el id del estudinte y el id del conductor
            const estudianteBDD = await Estudiantes.findOne({ _id: estudiante.estudiante, conductor: id });
            //¿Qué sucede si no se encuentra el estudiante?
            if (!estudianteBDD) {
                return res.status(404).json({ msg: "Lo sentimos, el estudiante no se encuentra registrado o no pertenece a su ruta" });
            }
        }

        // Crear un nuevo registro de asistencia
        const nuevaAsistencia = new AsistenciasTarde({
            conductor: id,
            fecha: fechaDeHoy, 
            estudiantes: estudiantes.map(estudianteLista => ({
                estudiante: estudianteLista.estudiante,
                asistio: estudianteLista.asistio
            }))
        });

        // Guardar el registro de asistencia en la base de datos
        await nuevaAsistencia.save();

        // Arreglo para almacenar las notificaciones
        const notificaciones = [];

        // Recorrer los estudiantes que asistieron en la tarde
        for (const estudiante of estudiantes) {
            // Obtener la información del estudiante
            const estudianteInfo = await Estudiantes.findById(estudiante.estudiante).lean();

            // Si existe el estudiante se envía la notificación
            if (estudianteInfo) {
                // Se obtienen datos del estudiante
                const { nombre, cedula } = estudianteInfo;
                // Se obtienen los representantes del estudiante
                const representantes = await Representantes.find({ cedulaRepresentado: cedula }).lean();
                // Se recorre los representantes para enviar la notificación
                for (const representante of representantes) {
                    // Se envía la notificación
                    const notificacion = await EnviarNotificacionAsistencia(id, nombre, representante._id, estudiante.asistio);
                    if (notificacion) {
                        notificaciones.push(notificacion);
                    }
                }
            }
        }

        return res.status(200).json({ msg: "Asistencia registrada exitosamente", asistencia: nuevaAsistencia, notificaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar la asistencia" });
    }
}

//Busqueda de la lista de asistencia
const BuscarLista = async (req, res) => {
    try {
        // Obtener el id del conductor logeado
        const { id } = req.user;

        // Obtener la fecha de los parámetros de la URL
        const { fecha } = req.params;

        // Verificación de la existencia de lista en la tarde
        const listaTarde = await AsistenciasTarde.findOne({ conductor: id, fecha: fecha }).select("-createdAt -updatedAt -__v");
        if (listaTarde) {
            return res.status(200).json({ msg_buscar_lista: `La lista de la tarde con fecha: ${fecha}, se ha encontrado exitosamente`, lista: listaTarde });
        }

        // Si no se encuentra ninguna lista
        return res.status(404).json({ msg_buscar_lista: "Lo sentimos, no se ha encontrado ninguna lista con esa fecha" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg_buscar_lista: "Error al buscar la lista" });
    }
}

//Actualizar la lista de asistencia 
const ActualizarLista = async (req, res) => {
    try {
        // Obtener el id del conductor logeado
        const { id } = req.user;
        // Obtener el id de la lista de los parámetros de la URL
        const { listaId } = req.params;
        // Obtener los datos de la lista de asistencia
        const { estudiantes } = req.body;

        // Verificación de los campos vacíos
        if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
            return res.status(400).json({ msg_actualizar_lista: "La lista de estudiantes no puede estar vacía" });
        }

        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) {
            return res.status(404).json({ msg_actualizar_lista: "Conductor no encontrado" });
        }

        // Verificar si los ids de los estudiantes se encuentran vinculados al conductor
        for (const estudiante of estudiantes) {
            const estudianteBDD = await Estudiantes.findOne({ _id: estudiante.estudiante, conductor: id });
            if (!estudianteBDD) {
                return res.status(404).json({ msg_actualizar_lista: "Lo sentimos, el estudiante no se encuentra registrado o no pertenece a su ruta" });
            }
        }

        // Verificación de la existencia de lista en la mañana
        const listaTarde = await AsistenciasTarde.findOne({ _id: listaId, conductor: id });

        // Fecha actual
        const fechaDeHoy = new Date().toISOString().split('T')[0];
        if (listaTarde && listaTarde.fecha === fechaDeHoy) {
            // Estructurar los datos de los estudiantes
            const estudiantesActualizados = estudiantes.map(estudianteLista => ({
                estudiante: estudianteLista.estudiante,
                asistio: estudianteLista.asistio
            }));

            // Actualización de la lista de asistencia
            await AsistenciasTarde.findByIdAndUpdate(
                listaId,
                { estudiantes: estudiantesActualizados },
                { new: true }
            );

            // Arreglo para almacenar las notificaciones
            const notificaciones = [];

            // Recorrer los estudiantes que asistieron en la mañana
            for (const estudiante of estudiantes) {
                // Obtener la información del estudiante
                const estudianteInfo = await Estudiantes.findById(estudiante.estudiante).lean();

                // Si existe el estudiante se envía la notificación
                if (estudianteInfo) {
                    // Se obtienen datos del estudiante
                    const { nombre, cedula } = estudianteInfo;
                    // Se obtienen los representantes del estudiante
                    const representantes = await Representantes.find({ cedulaRepresentado: cedula }).lean();
                    // Se recorre los representantes para enviar la notificación
                    for (const representante of representantes) {
                        // Se envía la notificación
                        const notificacion = await EnviarNotificacionAsistencia(id, nombre, representante._id, estudiante.asistio);
                        if (notificacion) {
                            notificaciones.push(notificacion);
                        }
                    }
                }
            }

            return res.status(200).json({ msg_actualizar_lista: `La lista de la tarde con ID: ${listaId} se ha actualizado exitosamente`, notificaciones });
        } else {
            return res.status(404).json({ msg_actualizar_lista: `La lista de la tarde con ID: ${listaId} no se ha actualizado ya que no existe o es de una fecha antigua` });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizar_lista: "Error al actualizar la lista" });
    }
}

//Eliminar lista de asistencia
const EliminarLista = async (req, res) => {
    try {
        // Obtener el id del conductor logeado
        const { id } = req.user;

        // Obtener el ID de la lista de los parámetros de la URL
        const { listaId } = req.params;

        // Verificación y eliminación de la lista en la tarde
        const listaTarde = await AsistenciasTarde.findOneAndDelete({ _id: listaId, conductor: id });
        if (listaTarde) {
            return res.status(200).json({ msg: `La lista de la tarde con ID: ${listaId}, se ha eliminado exitosamente` });
        }

        // Si no se encuentra ninguna lista
        return res.status(404).json({ msg_eliminar_lista: "Lo sentimos, no se ha encontrado ninguna lista con ese ID para eliminar" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg_eliminar_lista: "Error al eliminar la lista" });
    }
}

export {
    RegistroDeLosEstudiantes, 
    ActualizarPassword, 
    ListarEstudiantes,
    BuscarEstudianteCedula, 
    ActualizarEstudiante, 
    EliminarEstudiante, 
    ManejoActualizacionUbicacion, 
    CalcularDistanciaYTiempo, 
    VisuallizarPerfil, 
    ActualizarPerfil, 
    TomarListaTarde,
    BuscarLista,
    EliminarLista, 
    ActualizarLista
}