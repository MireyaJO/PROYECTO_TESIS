import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import Notificaciones from '../models/Notificaciones.js';
import Estudiantes from '../models/Conductor.js';
import Representantes from '../models/Representantes.js';
import {createToken} from '../middlewares/autho.js';
import {confirmacionDeCorreoRepresentante, recuperacionContraseniaRepresentante, confirmacionDeCorreoRepresentanteCambio} from '../config/nodemailer.js';
import {CalcularDistanciaYTiempo} from '../controllers/conductor_controller.js';
import AsistenciasManana from '../models/AsistenciasManana.js';
import AsistenciasTarde from '../models/AsistenciasTarde.js';

//Registro de los representantes
const RegistroDeRepresentantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        telefono,
        cedula,
        email,
        password,
        cedulaRepresentado
    } = req.body;

    // Convertir cedulaRepresentado a un array de números
    let cedulasRepresentadoArray;
    try {
        cedulasRepresentadoArray = cedulaRepresentado.split(',').map(cedula => {
            const numero = parseInt(cedula.trim(), 10);
            if (isNaN(numero)) {
                throw new Error(`La cédula "${cedula}" no es un número válido`);
            }
            return numero;
        });
    } catch (error) {
        return res.status(400).json({ msg_registro_representante: error.message });
    }

    // Comprobar si el email ya está registrado
    const verificarEmailBDD = await Representantes.findOne({email});
    if (verificarEmailBDD) {
        return res.status(400).json({ msg_registro_representante: "Lo sentimos, el email ya se encuentra registrado" });
    }

    // Comprobar si la cédula ya está registrada
    const verificarCedulaBDD = await Representantes.findOne({cedula});
    if (verificarCedulaBDD) {
        return res.status(400).json({ msg_registro_representante: "Lo sentimos, la cédula ya se encuentra registrada" })
    };

    // Comprobar si el telefono ya está registrado
    const verificarTelefonoBDD = await Representantes.findOne({telefono});
    if (verificarTelefonoBDD) {
        return res.status(400).json({ msg_registro_representante: "Lo sentimos, el telefono ya se encuentra registrado" })
    };

    // Crear un nuevo representante con los datos proporcionados
    const nuevoRepresentante = new Representantes({
        nombre,
        apellido,
        telefono,
        cedula,
        email,
        password,
        cedulaRepresentado: cedulasRepresentadoArray
    });

    // Verificar si se envió un archivo de imagen
    if (req.files && req.files.fotografia) {
        const file = req.files.fotografia;

        try {
            // Subir la imagen a Cloudinary con el nombre del conductor como public_id
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                public_id: `representantes/${nombre} ${apellido}`,
                folder: "representantes"
            });

            // Guardar la URL de la imagen en la base de datos
            nuevoRepresentante.fotografia = result.secure_url;

            // Eliminar el archivo local después de subirlo
            await fs.unlink(file.tempFilePath);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg_registro_conductor: "Error al subir la imagen" });
        }
    } else {
        return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debe subir una imagen" });
    }

    // Encriptar la contraseña antes de guardarla
    nuevoRepresentante.password = await nuevoRepresentante.encrypPassword(password);

    //Token para la confirmación de la cuenta 
    const token = nuevoRepresentante.crearToken();
    //Enviar el correo de confirmación
    await confirmacionDeCorreoRepresentante(email, nombre, apellido, token);

    //No se crea un token de confirmación, ya que, al conductor solo se le necesita enviar un correo para que se diriga a su cuenta
    try {

        // Búsqueda de los estudiantes dueños de las cédulas que el representante ha digitado
        const estudiantes = await Estudiantes.find({ cedula: { $in: cedulasRepresentadoArray } });

        // Verificar si no se encontraron estudiantes
        if (estudiantes.length !== cedulasRepresentadoArray.length) {
            const cedulasEncontradas = estudiantes.map(estudiante => estudiante.cedula);
            const cedulasNoEncontradas = cedulasRepresentadoArray.filter(cedula => !cedulasEncontradas.includes(cedula));
            return res.status(404).json({ msg_registro_representante: `No se encontraron estudiantes con las cédulas: ${cedulasNoEncontradas.join(', ')}` });
        }

        // Verificar si todos los estudiantes tienen el mismo ID de conductor
        const conductorId = estudiantes[0].conductor;
        const estudiantesConductorDiferente = estudiantes.filter(estudiante => estudiante.conductor.toString() !== conductorId.toString());
        if (estudiantesConductorDiferente.length > 0) {
            return res.status(400).json({ msg_registro_representante: "Todos los estudiantes deben pertenecer a la misma ruta" });
        }

        // Recorrer los estudiantes para asignarles el representante
        await Promise.all(estudiantes.map(async estudiante => {
            estudiante.representantes = nuevoRepresentante._id,
            await estudiante.save();
        }));

        // Guardar el nuevo representante en la base de datos
        await nuevoRepresentante.save();
        
        res.status(201).json({ msg_registro_representante: "Representante registrado exitosamente", nuevoRepresentante});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_registro_representante: "Error al registrar el representante" });
    }
}

//Confirmación del correo del representante
const ConfirmacionCorreo = async (req, res) => {
    //Obtenencion del token de la url 
    const token = req.params.token;
    try {
        // Verificar si el token es válido|
        if(!token) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const representante= await Representantes.findOne({token:token})

        // Verificaicón de la confirmación de la cuenta
        if(!representante?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
        
        // Verificar si el representante no se encuentra registrado
        if(!representante) return res.status(404).json({msg:"Lo sentimos, el representante no se encuentra registrado"})
        
        // Confirmar la cuenta del representante
        representante.token = null;
        //Cambiar el estado del correo a confirmado
        representante.confirmacionEmail=true
        await representante.save();

        res.status(200).json({ msg: "Cuenta confirmada exitosamente" });
    } catch (error) {
        res.status(400).json({ msg: "Token inválido o expirado" });
    }
}

//Logeo del representante
const LoginRepresentante = async (req, res) => {
    // Toma de los datos del conductor que se quiere logear
    const {email, password} = req.body;
    
    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg_login_conductor: "Lo sentimos, debes llenar todos los campos" });
    }
    
    try {
        // Verificación de que el conductor exista
        const representante = await Representantes.findOne({email : email});
        //Verificación de que el correo haya sido confirmado
        if(representante?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})

        // Verificación de que el representante exista
        if (!representante) {
            return res.status(404).json({ msg_login_representante: "Lo sentimos, el representnate no se encuentra registrado" });
        }
    
        // Verificar la contraseña
        const verificarPassword = await representante.matchPassword(password);

        if (!verificarPassword) {
            return res.status(404).json({ msg_login_representante: "Lo sentimos, el password no es el correcto" });
        }
    
        // Creación del token para el logeo del conductor
        const token = createToken({ id: representante._id, email: representante.email, role: 'representante' });
    
        // Mensaje de éxito
        return res.status(200).json({ token, msg_login_representante: "Bienvenido representante" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg_login_representante: "Error al autenticar el representante" });
    }
}

//Recuperación de la contraseña del representante
const RecuperacionContraseniaRepresentante = async (req, res) => {
    //Recepción del email del representante
    const {email} = req.body;

    //Verificación de que el email no se encuentre vacío
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const representante = await Representantes.findOne({email: email});
    try{
        //Verificación de que el representante exista
        if(!representante){
            return res.status(404).json({msg:"Lo sentimos, el representante no se encuentra registrado"})
        }

        //Creación del token para la recuperación de la contraseña
        const token = representante.crearToken();
        representante.token = token;

        //Envío del correo de recuperación de la contraseña
        await recuperacionContraseniaRepresentante(representante.email, representante.nombre, representante.apellido, token);
        await representante.save();
        res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
    }catch(error){
        console.error(error);
        res.status(500).json({ msg_recuperacion_contrasenia:"Error al recuperar la contraseña"});
    }
}

//Comprobación del token para la recuperación de la contraseña
const ComprobarTokenPasswordRepresentante= async (req, res) => { 
    //Recepción del token
    const tokenURL = req.params.token;

    //Verificación de que el token sea válido
    if(!tokenURL) return res.status(404).json({msg_recuperacion_contrasenia:"Lo sentimos, el token se encuentra vacío"});
    try {
        //Verificación de que exista un representante con el token 
        const representante = await Representantes.findOne({token: tokenURL});
        if(representante?.token !== tokenURL ) return res.status(404).json({msg_recuperacion_contrasenia:"Lo sentimos, el token no coincide con ningún representante"});
        await representante.save()
        res.status(200).json({msg_recuperacion_contrasenia:"Token confirmado, ya puedes crear tu nuevo password"}) 

    } catch (error) {
        console.error(error);
        res.status(500).json({msg_recuperacion_contrasenia:"Error al comprobar el token"});
    }
}

//Creación de la nueva contraseña
const NuevaPasswordRepresentante = async (req, res) => {
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
        const representante = await Representantes.findOne({token: tokenURL});
        representante.password = await representante.encrypPassword(passwordActual);
        //Eliminar el token de la base de datos para que no se pueda volver a usar 
        representante.token = null;
        await representante.save();
        res.status(201).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
    } catch (error) {
        console.error(error);
        res.status(500).json({msg_recuperacion_contrasenia:"Error al crear la nueva contraseña"});
    }
}

// Actualización de la contraseña del representante
const ActualizarPasswordRepresentante = async (req, res) => {
    // Toma de los datos del conductor que desea cambiar su contraseña
    const {passwordAnterior, passwordActual, passwordActualConfirm} = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg_actualizacion_contrasenia: "Lo sentimos, debes llenar todos los campos" });
    }

    try{
        // Verificación de la contraseña anterior
        const representante = await Representantes.findById(req.user.id);
        const verificarPassword = await representante.matchPassword(passwordAnterior);
        if (!verificarPassword) {
            return res.status(404).json({ msg_actualizacion_contrasenia: "Lo sentimos, la contraseña anterior no es la correcta" });
        }

        // Verificación de la confirmación de la contrseña actual 
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({ msg: "Lo sentimos, la contraseña nueva y su confirmación no coinciden" });
        }

        // Encriptar la contraseña antes de guardarla
        representante.password = await representante.encrypPassword(passwordActual);
        await representante.save();
        res.status(201).json({ msg_actualizacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_contrasenia: "Error al actualizar la contraseña" });
    }

}

// Información de los estudiantes representados 
const EstudiantesRepresentados = async (req, res) => {
    try {
        // Obtención del id del representante
        const { id } = req.user;

        // Búsqueda de los estudiantes representados por el representante y populación del conductor
        const estudiantes = await Estudiantes.find({ representantes: id }).populate('conductor', 'nombre apellido email telefono');

        // Verificación de que el representante tenga estudiantes representados
        if (estudiantes.length === 0) return res.status(404).json({ msg: "Lo sentimos, no tiene estudiantes representados" });

        // Envío de los estudiantes representados
        res.status(200).json({ estudiantesRepresentados: estudiantes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener los estudiantes representados" });
    }
}

// Visualización del perfil del representante
const VisuallizarPerfil = async (req, res) => {
    try {
        // Información del representante logeado
        const representante = await Representantes.findById(req.user.id).select("-password -createdAt -updatedAt -__v");
        // Verificación de la existencia del conductor
        if (!representante) return res.status(404).json({ msg: "Representante no encontrado" });
        //Si se encuentra el conductor se envía su información
        res.status(200).json(representante);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al visualizar el perfil del representante" });
    }
}

//Eliminar su cuenta de representante
const EliminarCuentaRepresentante = async (req, res) => {
    //Obtención del id del representante
    const {id} = req.user;
    try {
        await Representantes.findByIdAndDelete(id);
        res.status(200).json({ msg: "Cuenta eliminada satisfactoriamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar la cuenta del representante" });
    }
}

// Ruta que presenta a los representantes la distancia y los minutos en el que el conductor tarda en llegar a su vivienda
const AlertaLlegadaConductor = async (req, res) => {
    // Obtención de la información del representante
    const { id } = req.user;
    try {
        // Búsqueda de los estudiantes representados por el representante y con la información del conductor
        const estudiantes = await Estudiantes.find({ representantes: id }).populate('conductor', 'latitud longitud');

        // Verificación de que el representante tenga estudiantes representados
        if (estudiantes.length === 0) return res.status(404).json({ msg: "Lo sentimos, no tienes estudiantes representados" });

        // Creación de un array para las alertas
        const alertas = [];

        // Obtener el documento más reciente de los estudiantes que asistieron en la mañana
        const asistenciaManana = await AsistenciasManana.findOne({ estudianteAsistieronManana: { $in: estudiantes.map(e => e._id) } })
            .sort({ fecha: -1 })
            .populate('conductor', 'latitud longitud')
            .lean();

        console.log(asistenciaManana)

        if (asistenciaManana) {
            // Recorrer los estudiantes que asistieron en la mañana
            for (const estudianteId of asistenciaManana.estudianteAsistieronManana) {
                // Obtener la información del estudiante
                const estudiante = await Estudiantes.findById(estudianteId).lean();

                // Si existe el estudiante se envía la notificación
                if (estudiante) {
                    // Se obtienen datos del estudiante
                    const { nombre, cedula } = estudiante;
                    // Se obtienen los representantes del estudiante
                    const representantes = await Representantes.find({ cedulaRepresentado: cedula }).lean();
                    // Se recorre los representantes para enviar la notificación
                    for (const representante of representantes) {
                        // Obtener la latitud y longitud del conductor
                        const { latitud: latitudConductor, longitud: longitudConductor } = asistenciaManana.conductor;
                        // Obtener la latitud y longitud del estudiante
                        const { latitud: latitudEstudiante, longitud: longitudEstudiante } = estudiante;

                        // Calcular la distancia y el tiempo entre el conductor y el estudiante
                        const { distancia, tiempo } = await CalcularDistanciaYTiempo(latitudConductor, longitudConductor, latitudEstudiante, longitudEstudiante);

                        // Crear la notificación con la distancia y el tiempo
                        const notificacion = {
                            representante: representante._id,
                            estudiante: `${nombre}`,
                            distancia,
                            tiempo
                        };

                        // Agregar la notificación al array de alertas
                        alertas.push(notificacion);
                    }
                }
            }
        }

        // Obtener el documento más reciente de los estudiantes que asistieron en la tarde
        const asistenciaTarde = await AsistenciasTarde.findOne({ estudianteAsistieronTarde: { $in: estudiantes.map(e => e._id) } })
            .sort({ fecha: -1 })
            .populate('conductor', 'latitud longitud')
            .lean();

        if (asistenciaTarde) {
            // Recorrer los estudiantes que asistieron en la tarde
            for (const estudianteId of asistenciaTarde.estudianteAsistieronTarde) {
                // Obtener la información del estudiante
                const estudiante = await Estudiantes.findById(estudianteId).lean();

                // Si existe el estudiante se envía la notificación
                if (estudiante) {
                    // Se obtienen datos del estudiante
                    const { nombre, cedula } = estudiante;
                    // Se obtienen los representantes del estudiante
                    const representantes = await Representantes.find({ cedulaRepresentado: cedula }).lean();
                    // Se recorre los representantes para enviar la notificación
                    for (const representante of representantes) {
                        // Obtener la latitud y longitud del conductor
                        const { latitud: latitudConductor, longitud: longitudConductor } = asistenciaTarde.conductor;
                        // Obtener la latitud y longitud del estudiante
                        const { latitud: latitudEstudiante, longitud: longitudEstudiante } = estudiante;

                        // Calcular la distancia y el tiempo entre el conductor y el estudiante
                        const { distancia, tiempo } = await CalcularDistanciaYTiempo(latitudConductor, longitudConductor, latitudEstudiante, longitudEstudiante);

                        // Crear la notificación con la distancia y el tiempo
                        const notificacion = {
                            representante: representante._id,
                            estudiante: `${nombre}`,
                            distancia,
                            tiempo
                        };

                        // Agregar la notificación al array de alertas
                        alertas.push(notificacion);
                    }
                }
            }
        }

        res.status(200).json({ alertas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al recibir la alerta" });
    }
}

//Todas las notificaciones de los representantes
const VerNotificaciones = async (req, res) => {
    const { id } = req.user;

    try {
        // Obtener las notificaciones del representante
        const notificaciones = await Notificaciones.find({ representante: id }).lean();

        // Verificación de que el representante tenga notificaciones
        if (notificaciones.length === 0) return res.status(404).json({ msg: "No tienes notificaciones" });

        res.status(200).json({ notificaciones });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener las notificaciones", error: error.message });
    }
};

//Actualizar su perfil de representante
const ActualizarPerfilRepresentante = async (req, res) => {
    // Obtención de datos de lo escrito por el representante
    const { nombre, apellido, telefono, genero, cedula, email } = req.body;
    // Obtención del id del representante logeado
    const { id } = req.user;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });

    try {
        // Verificación de la existencia del representante
        const representante = await Representantes.findById(id);
        if (!representante) return res.status(400).json({ msg: "Lo sentimos, el representante no se encuentra registrado" });

        // Comprobar si el teléfono ya está registrado por otro representante
        const verificarTelefonoBDD = await Representantes.findOne({ telefono, _id: { $ne: id } });
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el teléfono ya se encuentra registrado" });
        }

        // Comprobar si la cédula ya está registrada por otro representante
        const verificarCedulaBDD = await Representantes.findOne({ cedula, _id: { $ne: id } });
        if (verificarCedulaBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, la cédula ya se encuentra registrada" });
        }

        // Comprobar si el email ya está registrado por otro representante
        const verificarEmailBDD = await Representantes.findOne({ email, _id: { $ne: id } });
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado" });
        }

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografia) {
            const file = req.files.fotografia;
            try {
                // Subir la imagen a Cloudinary con el nombre del representante como public_id
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                    public_id: `representantes/${representante.nombre} ${representante.apellido}`,
                    folder: "representantes"
                });
                // Guardar la URL de la imagen en la base de datos
                representante.fotografia = result.secure_url;
                // Eliminar el archivo local después de subirlo
                await fs.unlink(file.tempFilePath);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_actualizacion_perfil: "Error al subir la imagen" });
            }
        }

        // Si el email cambia, enviar un enlace de confirmación al nuevo correo
        if (email && email !== representante.email) {
            // Crear un token JWT con el ID del representante y el nuevo email
            const token = representante.crearToken();
            representante.token = token;
            representante.tokenEmail = email;

            // Guardar el token en la base de datos
            await representante.save();

            // Enviar un email de confirmación al nuevo correo electrónico
            await confirmacionDeCorreoRepresentanteCambio(email, representante.nombre, representante.apellido, token);

            // Enviar una respuesta al cliente indicando que se ha enviado un enlace de confirmación
            return res.status(200).json({ msg: "Se ha enviado un enlace de confirmación al nuevo correo electrónico" });
        }

        // Actualización del perfil del representante
        representante.nombre = nombre;
        representante.apellido = apellido;
        representante.telefono = telefono;
        representante.genero = genero;
        representante.cedula = cedula;

        // Guardar los cambios en la base de datos
        await representante.save();

        res.status(200).json({ msg_actualizacion_perfil: "Los datos del representante han sido actualizados exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_perfil: "Error al actualizar el perfil del representante" });
    }
};

//Confirmación del nuevo correo del representante
const ConfirmacionCorreoNuevoRepresentante = async (req, res) => {
    //Recepcion del token proporcionado por la URL
    const { token } = req.params;

    try {
        // Buscar representante por token
        const representante = await Representantes.findOne({ token });
        if (!representante) return res.status(400).json({ msg: "Token inválido o expirado" });

        // Actualizar el email
        representante.email = representante.tokenEmail;
        representante.token = null;
        representante.tokenEmail = null;

        // Guardar los cambios en la base de datos
        await representante.save();

        res.status(200).json({ msg: "Correo electrónico actualizado exitosamente, puede logearse con su nuevo email" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al confirmar el cambio de correo electrónico" });
    }
};

export {
    RegistroDeRepresentantes, 
    ConfirmacionCorreo, 
    LoginRepresentante, 
    RecuperacionContraseniaRepresentante, 
    ComprobarTokenPasswordRepresentante, 
    NuevaPasswordRepresentante, 
    ActualizarPasswordRepresentante,
    EstudiantesRepresentados, 
    VisuallizarPerfil, 
    EliminarCuentaRepresentante, 
    AlertaLlegadaConductor, 
    VerNotificaciones,
    ActualizarPerfilRepresentante, 
    ConfirmacionCorreoNuevoRepresentante
}
