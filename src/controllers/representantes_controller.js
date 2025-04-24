import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Conductores.js';
import Estudiantes from '../models/Estudiantes.js';
import Representantes from '../models/Representantes.js';
import {confirmacionDeCorreoRepresentante, confirmacionDeCorreoRepresentanteCambio } from '../config/nodemailer.js';

//Registro de los representantes
const RegistroDeRepresentantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        telefono,
        cedula,
        email,
        institucion,
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
    const verificarEmailConductor = await Conductores.findOne({email});

    if (verificarEmailBDD) {
        return res.status(400).json({ msg_registro_representante: "Lo sentimos, el email ya se encuentra registrado como representante" });
    }

    if (verificarEmailConductor) {
        return res.status(400).json({ msg_registro_representante: "Lo sentimos, el email ya se encuentra registrado como conductor" })
    };

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
        institucion,
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

        //Datos del admin para el correo de confirmación
        const admin = await Conductores.findOne({ roles: { $in: ['admin'] } });

        //Enviar el correo de confirmación
        await confirmacionDeCorreoRepresentante(email, nombre, apellido, token, admin.apellido, admin.nombre);
        
        res.status(200).json({ msg_registro_representante: "Representante registrado exitosamente", registroRepresentante: nuevoRepresentante});
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
        // Verificar si el token es válido
        if(!token) return res.status(400).json({msg_confirmar_correo:"Lo sentimos, no se puede validar la cuenta"})
        const representante= await Representantes.findOne({token:token})

        // Verificaicón de la confirmación de la cuenta
        if(!representante?.token) return res.status(400).json({msg_confirmar_correo:"La cuenta ya ha sido confirmada"})
        
        // Verificar si el representante no se encuentra registrado
        if(!representante) return res.status(404).json({msg_confirmar_correo:"Lo sentimos, el representante no se encuentra registrado"})
        
        // Confirmar la cuenta del representante
        representante.token = null;
        //Cambiar el estado del correo a confirmado
        representante.confirmacionEmail=true
        await representante.save();

        res.status(200).json({ msg_confirmar_correo: "Cuenta confirmada exitosamente" });
    } catch (error) {
        res.status(400).json({ msg_confirmar_correo: "Token inválido o expirado" });
    };
};

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
            return res.status(400).json({ msg_actualizacion_contrasenia: "Lo sentimos, la contraseña nueva y su confirmación no coinciden" });
        }

        // Encriptar la contraseña antes de guardarla
        representante.password = await representante.encrypPassword(passwordActual);
        await representante.save();
        res.status(200).json({ msg_actualizacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_contrasenia: "Error al actualizar la contraseña" });
    };
};

// Información de los estudiantes representados 
const ConductorInfo = async (req, res) => {
    try {
        // Obtención del id del representante
        const { id } = req.user;

        // Búsqueda de los estudiantes representados por el representante y populación del conductor
        const estudiantes = await Estudiantes.find({ representantes: id }).populate('conductor', 'nombre apellido email telefono rutaAsignada sectoresRuta fotografiaDelConductor esReemplazo').select("-createdAt -updatedAt -__v");

        // Verificación de que el representante tenga estudiantes representados
        if (estudiantes.length === 0) return res.status(404).json({ msg_info_conductor: "Lo sentimos, no tiene estudiantes representados" });

        // Verificación de la existencia del conductor
        const conductor = estudiantes[0].conductor;

        // Envío de los estudiantes representados
        res.status(200).json({ conductorDeEstudiantes: conductor});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_info_conductor: "Error al obtener los estudiantes representados" });
    };
};

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
    };
};

//Eliminar su cuenta de representante
const EliminarCuentaRepresentante = async (req, res) => {
    //Obtención del id del representante
    const {id} = req.user;
    try {
        //Eliminar la imagen en Cloudinary
        const representante = await Representantes.findById(id);

        //Condicion para que se elimine su cuenta 
        if(representante.cedulaRepresentado.length === 0){
            //Eliminar la imagen en Cloudinary 
            const publicId = `representantes/${representante.nombre} ${representante.apellido}`; 
            try{
                await cloudinary.v2.uploader.destroy(publicId);
            }catch{
                console.error("Error al eliminar la imagen en Cloudinary");
                return res.status(500).json({msg:"Error al eliminar la imagen"})
            }

            //Eliminación del representante en la base de datos
            await Representantes.findByIdAndDelete(id);
            res.status(200).json({ msg_eliminacion_cuenta: "Cuenta eliminada satisfactoriamente" });
        } else if(representante.cedulaRepresentado.length > 0){
            return res.status(400).json({msg_eliminacion_cuenta:"Lo sentimos, no puedes eliminar tu cuenta si aún tienes estudiantes representados"})
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_eliminacion_cuenta: "Error al eliminar la cuenta del representante" });
    };
};

//Actualizar su perfil de representante
const ActualizarPerfilRepresentante = async (req, res) => {
    // Obtención de datos de lo escrito por el representante
    const { nombre, apellido, telefono, cedula, email } = req.body;
    // Obtención del id del representante logeado
    const { id } = req.user;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });

    try {
        // Verificación de la existencia del representante
        const representante = await Representantes.findById(id);
        if (!representante) return res.status(404).json({ msg_actualizacion_perfil: "Lo sentimos, el representante no se encuentra registrado" });

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
        const verificarEmailConductor = await Conductores.findOne({email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como representados" });
        }

        if (verificarEmailConductor) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        }

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografia) {
            const file = req.files.fotografia;
            try {
                //Definir el public_id de Cloudinary
                const publicId = `representantes/${representante.nombre} ${representante.apellido}`; 

                // Eliminar la imagen anterior en Cloudinary
                await cloudinary.v2.uploader.destroy(publicId);
                
                // Subir la imagen a Cloudinary con el nombre del representante como public_id
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                    public_id: publicId,
                    folder: "representantes", 
                    overwrite: true
                });
                // Guardar la URL de la imagen en la base de datos
                representante.fotografia = result.secure_url;
                // Eliminar el archivo local después de subirlo
                await fs.unlink(file.tempFilePath);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_actualizacion_perfil: "Error al subir la imagen" });
            };
        };

        // Si el email cambia, enviar un enlace de confirmación al nuevo correo
        if (email !== representante.email) {
            // Crear un token JWT con el ID del representante y el nuevo email
            const token = representante.crearToken('confirmacionCorreo');
            representante.emailTemporal = email;

            // Guardar el token en la base de datos
            await representante.save();

            //Datos del admin para el correo de confirmación
            const admin = await Conductores.findOne({ roles: { $in: ['admin'] } });

            // Enviar un email de confirmación al nuevo correo electrónico
            await confirmacionDeCorreoRepresentanteCambio(email, representante.nombre, representante.apellido, token, admin.apellido, admin.nombre);

            // Enviar una respuesta al cliente indicando que se ha enviado un enlace de confirmación
            return res.status(200).json({ msg_actualizacion_perfil: "Se ha enviado un enlace de confirmación al nuevo correo electrónico" });
        };

        // Actualización del perfil del representante
        representante.nombre = nombre;
        representante.apellido = apellido;
        representante.telefono = telefono;
        representante.cedula = cedula;

        // Guardar los cambios en la base de datos
        await representante.save();

        res.status(200).json({ msg_actualizacion_perfil: "Los datos del representante han sido actualizados exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_actualizacion_perfil: "Error al actualizar el perfil del representante" });
    };
};

export {
    RegistroDeRepresentantes, 
    ConfirmacionCorreo, 
    ActualizarPasswordRepresentante,
    ConductorInfo, 
    VisuallizarPerfil, 
    EliminarCuentaRepresentante, 
    ActualizarPerfilRepresentante
}
