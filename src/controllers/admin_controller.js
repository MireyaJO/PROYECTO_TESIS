import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Conductores.js';
import Estudiantes from '../models/Estudiantes.js'
import Representantes from '../models/Representantes.js';
import {enviarCorreoConductor, actualizacionDeConductor, eliminacionDelConductor,  informacionEliminacion, cambioAdmin, cambioConductor, asignacionAdministrador, nuevoAdministrador} from "../config/nodemailer.js"; 
import crypto from 'crypto';
import e from 'cors';

// Registros de los conductores
const RegistroDeLosConductores = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        cooperativa,
        rutaAsignada, 
        sectoresRuta,
        generoConductor,
        telefono, 
        placaAutomovil,
        cedula,
        email,
    } = req.body;

    //Id del admin logeado 
    const {id} = req.user;
    try{
        // Comprobar si el email ya está registrado
        const verificarEmailBDD = await Conductores.findOne({email});
        const verificarRepresentateBDD = await Representantes.findOne({email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        }
        if (verificarRepresentateBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como representante" });
        }

        // Comprobar si la cédula ya está registrada
        const verificarCedulaBDD = await Conductores.findOne({cedula});
        const verificarCedulaRepresentanteBDD = await Representantes.findOne({cedula});
        if (verificarCedulaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los conductores" });
        };
        if (verificarCedulaRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los representantes" });
        };

        // Comprobar si la ruta ya está asignada
        const verificarRutaBDD = await Conductores.findOne({rutaAsignada});
        if (verificarRutaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la ruta ya se encuentra asignada" })
        } 

        // Comprobar si el telefono ya está registrado
        const verificarTelefonoBDD = await Conductores.findOne({telefono});
        const verificarTelefonoRepresentanteBDD = await Representantes.findOne({telefono});
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado en los conductores" });
        };
        if (verificarTelefonoRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado en los representantes" });
        }

        // Comprobar si la placa ya está registrada
        const verificarPlacaBDD = await Conductores.findOne({placaAutomovil});
        if (verificarPlacaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la placa ya se encuentra registrada" })
        };

        //Datos del coordinador de rutas
        const coordinadorRutas = await Conductores.findById(id);
        if (!coordinadorRutas) return res.status(404).json({ msg_registro_conductor: "Lo sentimos, el coordinador de rutas no se encuentra registrado" });

        // Crear un nuevo conductor con los datos proporcionados
        const nuevoConductor = new Conductores({
            nombre,
            apellido,
            cooperativa,
            rutaAsignada,
            sectoresRuta,
            generoConductor,
            institucion: coordinadorRutas.institucion,
            telefono, 
            placaAutomovil,
            cedula,
            email,
        });

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;

            try {
                // Subir la imagen a Cloudinary con el nombre del conductor como public_id
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                    public_id: `${nombre}_${apellido}`.replace(/\s+/g, '_'),
                    folder: "conductores"
                });

                // Guardar la URL de la imagen en la base de datos
                nuevoConductor.fotografiaDelConductor = result.secure_url;

                // Eliminar el archivo local después de subirlo
                await fs.unlink(file.tempFilePath);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_registro_conductor: "Error al subir la imagen" });
            }
        } else {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debes subir una imagen" });
        }

        // Generar una contraseña aleatoria
        const randomPassword = crypto.randomBytes(8).toString('hex');

        // Encriptar la contraseña antes de guardarla
        nuevoConductor.password = await nuevoConductor.encrypPassword(randomPassword);

        // Guardar el nuevo conductor en la base de datos
        await nuevoConductor.save();

        //No se crea un token de confirmación, ya que, al conductor solo se le necesita enviar un correo para que se diriga a su cuenta
        await enviarCorreoConductor(email, randomPassword, rutaAsignada, sectoresRuta, nuevoConductor.nombre, nuevoConductor.apellido, coordinadorRutas.apellido, coordinadorRutas.nombre); 

    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al registrar el conductor",
            error: error.message
        });
    }
};

// Buscar un conductor en especifico por la ruta asignada
const BuscarConductorRuta = async (req, res) => {
    try {
        // Obtener el número de la ruta de los parámetros de la URL
        const {rutaAsignada} = req.params;

        // Verificación de la existencia de la ruta
        const conductor = await Conductores.find({rutaAsignada}).select("-password -updatedAt -createdAt -__v");
        if (conductor.length === 0) {
            return res.status(400).json({ msg: "Lo sentimos, no se ha encontrado ningún conductor trabajando en la Unidad Educativa Particular EMAÚS con esa ruta" });
        }

        // Mensaje de éxito
        res.status(200).json({ msg_buscar_conductor_ruta: `El conductor de la ruta ${rutaAsignada} se han encontrado exitosamente`, conductor:conductor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            msg_buscar_conductor_ruta: "Error al buscar conductores por ruta", 
            error: error.message 
        });
    }
}

// Listar todos los conductores de la Unidad Educativa Particular EMAÚS
const ListarConductor = async (req, res) => {
    try{
        //Obtención de los conductores normales
        const conductores = await Conductores.find({roles: { $in: ["conductor"], $nin: ["admin"] }}).select("-password -updatedAt -createdAt -__v");

        //Validación de que existan conductores
        if (conductores.length === 0) return res.status(400).json({msg_listar_conductores:"El administrador no ha registrado a ningún conductor"});
        
        //Mensaje de exito
        res.status(200).json({ msg_listar_conductores: "Los conductores se han encontrado exitosamente", listar_conductores: conductores});
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg_listar_conductores: "Error al listar los conductores",
            error: error.message
        });
    }    
}

//Actualizacion de las rutas y sectores de los conductores por su id
const ActualizarRutasYSectoresId = async (req, res) => {
    //Obtener el id de los parámetros de la URL
    const {id} = req.params;

    //Obtener la ruta y los sectores de la solicitud
    const {rutaAsignada, sectoresRuta} = req.body;

    //Id del conductor logeado
    const {id_coordinador} = req.user;

    try{
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById({_id: id});
        if (!conductor) return res.status(400).json({ msg_actualizacion_conductor: "Lo sentimos, el conductor no se ha encontrado" });

        // Para conocer el nombre del conductor que posee ese id
        const {nombre, apellido} = conductor;

        // Actualización de los datos
        await Conductores.findOneAndUpdate(
            id,
            { 
                rutaAsignada, 
                sectoresRuta
            },
            // Esta opción devuelve el documento actualizado
            { new: true } 
        );

        //Envio del correo al conductor 
        await actualizacionDeConductor(conductor.email, conductor.apellido, conductor.nombre, rutaAsignada, sectoresRuta, id_coordinador.apellido, id_coordinador.nombre);

        res.status(200).json({
            msg_actualizacion_conductor: `La ruta y sectores que cubrirá el conductor ${nombre} ${apellido} han sido actualizados exitosamente`
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg_actualizacion_conductor: "Error al actualizar las rutas y sectores de los conductores",
            error: error.message
        });
    }
}

//Eliminación de un conductor
const EliminarConductor = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const {id} = req.params;

    //Id del conductor logeado
    const {id_coordinador} = req.user;
   try{
        //Verificación de la existencia del conductor
        const conductor = await Conductores.findById({_id: id});
        if(!conductor) return res.status(400).json({msg:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
        if (conductor.numeroEstudiantes > 0) {
            res.status(400).json({msg_eliminacion_conductor:"Lo sentimos, el conductor tiene estudiantes asignados, por favor realice el reemplazo del conductor antes de eliminarlo"});
        } 
        
        //Eliminar la imagen en Cloudinary 
        const publicId = `conductores/${conductor.nombre}_${conductor.apellido}`;
        try{
            await cloudinary.v2.uploader.destroy(publicId);
        }catch{
            console.error("Error al eliminar la imagen en Cloudinary");
            return res.status(500).json({msg_eliminacion_conductor:"Error al eliminar la imagen"}); 
        }

        //Eliminación del conductor en la base de datos
        await Conductores.findOneAndDelete({_id: id});

        //Envio del correo al conductor
        await eliminacionDelConductor(conductor.email, conductor.nombre, conductor.apellido, id_coordinador.apellido, id_coordinador.nombre);
        
        //Mensaje de exito
        res.status(200).json({msg_eliminacion_conductor:`El conductor ${conductor.nombre} ${conductor.apellido} ha sido eliminado exitosamente`}); 
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg_eliminacion_conductor: "Error al eliminar el conductor",
            error: error.message
        });
   }
};

const ReemplazoTemporal = async (req, res) => {
    // Obtener los ids del conductor antiguo y nuevo de los parámetros de la URL
    const {idAntiguo, idReemplazo} = req.params;

    //Id del coordinador de rutas
    const {idCoordinador} = req.user;

    try{
        //Verificar si los conductores existen 
        const conductorAntiguo = await Conductores.findById({_id: idAntiguo});
        const conductorReemplazo = await Conductores.findById({_id: idReemplazo});
        //El conductor antiguo no existe 
        if(!conductorAntiguo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorAntiguo.nombre} ${conductorAntiguo.apellido} no se encuentra registrado`});

        //El conductor de reemplazo no existe
        if(!conductorReemplazo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido} no se encuentra registrado`});

        //El conductor de reemplazo ya tiene estudiantes asignados
        if(conductorReemplazo.numeroEstudiantes > 0) return res.status(400).json({msg_reemplazo:`El conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido} ya tiene estudiantes asignados no puede ser reemplazo`});

        //El conductor antiguo no tiene estudiantes asignados
        if(conductorAntiguo.numeroEstudiantes === 0) return res.status(400).json({msg_reemplazo:`El conductor ${conductorAntiguo.nombre} ${conductorAntiguo.apellido} no tiene estudiantes asignados por lo que no se puede realizar el reemplazo`});

        //Realizar el reemplazo de los estudiantes
        const estudiantesConductorAntiguo = await Estudiantes.find({conductor: idAntiguo});
        for(const estudianteId of estudiantesConductorAntiguo){
            //Actualizar el conductor de los estudiantes
            await Estudiantes.findByIdAndUpdate(estudianteId._id, { conductor: conductorReemplazo._id });
            //Se guarda la actualización en la base de datos de estudiantes
            await estudiantesConductorAntiguo.save();

            //Objeto con la información de cada estudiante que se encvuentra vinculado al conductor antiguo
            const estudianteRegistrado = {idEstudiante: estudianteId._id, nombreEstudiante: estudianteId.nombre, apellidoEstudiante: estudianteId.apellido, nivelEscolarEstudiante: estudianteId.nivelEscolar, 
                paraleloEstudiante: estudianteId.paralelo, cedulaEstudiante: estudianteId.cedula} 
            //Actualizar el campo "estudiantesRegistrados" del conductor de reemplazo
            idReemplazo.estudiantesRegistrados.push(estudianteRegistrado); 

            //Obtener los representantes de los estudiantes
            for(const representanteId of estudianteId.representantes){
                const representante = await Representantes.findById(representanteId); 
                if(representante){
                    await cambioConductor(representante.email, representante.nombre, representante.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.nombre, conductorReemplazo.apellido, idCoordinador.apellido, idCoordinador.nombre);            
                }
            }
        }

        //Actualizar información del conductor reemplazo
        const cantidadEstudiantes = estudiantesConductorAntiguo.length;
        //Actualizar el número de estudiantes del conductor de reemplazo
        conductorReemplazo.numeroEstudiantes = cantidadEstudiantes;
        //Actualizar la ruta y sectores del conductor de reemplazo
        conductorReemplazo.rutaAsignada = conductorAntiguo.rutaAsignada;
        conductorReemplazo.sectoresRuta = conductorAntiguo.sectoresRuta;
        //Desactivar al conductor antiguo 
        conductorAntiguo.estado = false;
        //Guardar los cambios en la base de datos de conductores
        await conductorReemplazo.save();
        await conductorAntiguo.save();

        res.status(200).json({
            msg_reemplazo: `El reemplazo temporal se ha realizado exitosamente. Los estudiantes han sido transferidos al conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido}, y el conductor original ha sido marcado como inactivo.`,
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            msg_reemplazo:"Error al realizar el reemplazo temporal",
            error: error.message
        });
    }
};

const ReemplazoPermanente = async (req, res) => {
    // Obtener los ids del conductor antiguo y nuevo de los parámetros de la URL
    const {idAntiguo, idReemplazo} = req.params;

    try{
        // Verificación de la existencia de los conductores 
        const conductorAntiguo = await Conductores.findById({_id: idAntiguo, estado: true});
        const conductorReemplazo = await Conductores.findById({_id: idReemplazo, estado: true});

        //El conductor antiguo existe
        if(!conductorAntiguo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorAntiguo.nombre} ${conductorAntiguo.apellido} no se encuentra registrado o esta inactivo`});

        //El conductor de reemplazo existe
        if(!conductorReemplazo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido} no se encuentra registrado o esta inactivo`});

        //El conductor de reemplazo ya tiene estudiantes asignados
        if(conductorReemplazo.numeroEstudiantes > 0) return res.status(400).json({msg_reemplazo:`El conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido} ya tiene estudiantes asignados no puede ser reemplazo`});

        //El conductor antiguo no tiene estudiantes asignados
        if(conductorAntiguo.numeroEstudiantes === 0) return res.status(400).json({msg_reemplazo:`El conductor ${conductorAntiguo.nombre} ${conductorAntiguo.apellido} no tiene estudiantes asignados por lo que no se puede realizar el reemplazo`});

        //Realizar el reemplazo de los estudiantes
        const estudiantesConductorAntiguo = await Estudiantes.find({conductor: idAntiguo});
        for(const estudianteId of estudiantesConductorAntiguo){
            //Actualizar el conductor de los estudiantes
            await Estudiantes.findByIdAndUpdate(estudianteId._id, { conductor: conductorReemplazo._id });

            //Se guarda la actualización en la base de datos de estudiantes
            await estudiantesConductorAntiguo.save();

            //Objeto que contiene la información de cada estudiante que se encuentra vinculado al conductor antiguo
            const estudianteRegistrado = {idEstudiante: estudianteId._id, nombreEstudiante: estudianteId.nombre, apellidoEstudiante: estudianteId.apellido, nivelEscolarEstudiante: estudianteId.nivelEscolar, 
                paraleloEstudiante: estudianteId.paralelo, cedulaEstudiante: estudianteId.cedula}
            //Actualizar el campo "estudiantesRegistrados" del conductor de reemplazo
            idReemplazo.estudiantesRegistrados.push(estudianteRegistrado);

            //Obtener los representantes de los estudiantes 
            for(const representanteId of estudianteId.representantes){
                const representante = await Representantes.findById(representanteId);
                if(representante){
                    await cambioConductor(representante.email, representante.nombre, representante.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.nombre, conductorReemplazo.apellido, idCoordinador.apellido, idCoordinador.nombre);
                }
            }
        }

        //Actualizar información del conductor de reemplazo
        const cantidadEstudiantes = estudiantesConductorAntiguo.length;
        //Actualizar el número de estudiantes del conductor de reemplazo
        conductorReemplazo.numeroEstudiantes = cantidadEstudiantes;
        //Actualizar la ruta y sectores del conductor de reemplazo
        conductorReemplazo.rutaAsignada = conductorAntiguo.rutaAsignada;
        conductorReemplazo.sectoresRuta = conductorAntiguo.sectoresRuta;
        //Eliminación de la imagen del conductor antiguo en Cloudinary
        const publicId = `conductores/${conductorAntiguo.nombre}_${conductorAntiguo.apellido}`;
        try{
            await cloudinary.v2.uploader.destroy(publicId);
        }catch{
            console.error("Error al eliminar la imagen en Cloudinary");
            return res.status(500).json({msg_eliminacion_conductor:"Error al eliminar la imagen"}); 
        } 
        //Eliminación defenitiva del conductor antiguo
        await Conductores.findOneAndDelete({_id: idAntiguo});
        //Guardar los cambios en la base de datos de conductores
        await conductorReemplazo.save();

        res.status(200).json({
            msg_reemplazo: `El reemplazo permanente se ha realizado exitosamente. Los estudiantes han sido transferidos al conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido}, y el conductor original ha sido eliminado del sistema.`,
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            msg_reemplazo:"Error al realizar el reemplazo permanente",
            error: error.message
        });
    }
};

const VisualizarPerfil = async (req, res)=>{
    try{
        // Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id).select("-password -createdAt -updatedAt -__v");
        // Verificación de la existencia del conductor
        if (!conductor) return res.status(404).json({ msg_visualizar_conductor: "Conductor no encontrado" });
        //Si se encuentra el conductor se envía su información
        res.status(200).json(conductor);

        res.status(200).json({
            msg_admin: "Perfil del administrador encontrado exitosamente",
            administrador: conductor
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al visualizar el perfil del administrador",
            error: error.message
        });
    }
}

const ActualizarInformacionAdmin = async (req, res) => {
    //Extraer los campos del cuerpo de la solicitud
    const {
        telefono, 
        placaAutomovil, 
        rutaAsignada,
        sectoresRuta, 
        email, 
    } = req.body;
    //Obtención del id del conductor logeado
    const {id} = req.user;
    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });
    try{
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) return res.status(404).json({ msg_actualizacion_perfil: "Lo sentimos, el conductor no se encuentra registrado" });
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
        const verificacionRepresentante = await Representantes.findOne({email: email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        };
        if (verificacionRepresentante){
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, el email ya se encuentra registrado como representante" });
        };

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;
            try {
                // Definir el public_id para Cloudinary
                const publicId = `conductores/${conductor.nombre}_${conductor.apellido}_admin`;

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
        };

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
            return res.status(200).json({ msg_actualizacion_perfil: "Se ha enviado un enlace de confirmación al nuevo correo electrónico" });
        };

        // Actualización de los datos
        conductor.telefono = telefono;
        conductor.placaAutomovil = placaAutomovil;
        conductor.rutaAsignada = rutaAsignada;
        conductor.sectoresRuta = sectoresRuta;
        conductor.email = email;

        // Guardar los cambios en la base de datos
        await conductor.save();
        res.status(200).json({ msg_actualizacion_perfil: "Los datos del conductor han sido actualizados exitosamente" });
    } catch(error){
        console.error(error);
        res.status(500).json({msg_actualizacion_perfil:"Error al actualizar el perfil del conductor"});
    }
}

const AsignarPrivilegiosDeAdmin = async (req, res) => {
    //Obtener el id del conductor que se desea convertir en administrador
    const {idAsignacion} = req.params;
    const {id} = req.user;
    try{
        //Verificación de la existencia del conductor
        const conductor = await Conductores.findById(idAsignacion);
        if (!conductor) return res.status(404).json({ msg: "Lo sentimos, el conductor no se encuentra registrado" });

        //Verificación de que el conductor no sea un administrador
        if (conductor.roles.includes("admin")) return res.status(400).json({ msg: "Lo sentimos, el conductor ya posee privilegios de administrador" });
        
        //Asignación de los privilegios de administrador
        conductor.roles.push("admin");
        
        //Guardado de los cambios en la base de datos
        await conductor.save();
        
        //Id del conductor logeado
        const conductorAdmin = await Conductores.findById(id);
        
        //Verificación de la existencia del conductor
        if (!conductorAdmin) return res.status(404).json({ msg: "Lo sentimos, el conductor no se encuentra registrado" });
        
        //Verificación de que el conductor sea un administrador
        if (!conductorAdmin.roles.includes("admin")) return res.status(400).json({ msg: "Lo sentimos, el conductor no posee privilegios de administrador" });
        
        //Quitar los privilegios de administrador
        const index = conductorAdmin.roles.indexOf("admin");
        
        //Eliminar el rol de administrador
        if (index > -1) {
            conductorAdmin.roles.splice(index, 1);
        }
        
        //Guardado de los cambios en la base de datos
        await conductorAdmin.save();

        //Envio del correo a los conductores que no poseen privilegios de administrador
        const conductores = await Conductores.find({roles: 'conductor'});
        for(const conductorNormal of conductores){
            await cambioAdmin(conductor.nombre, conductor.apellido, conductorNormal.email, conductorNormal.nombre, conductorNormal.apellido); 
        }

        //Información al conductor que se le han asignado los privilegios de administrador
        await asignacionAdministrador(conductor.email, conductor.nombre, conductor.apellido, conductor.rutaAsignada, 
            conductor.sectoresRuta, conductorAdmin.nombre, conductorAdmin.apellido);
        
        //Guardado de los cambios en la base de datos
        await conductorAdmin.save();

        res.status(200).json({ msg: "Los privilegios de administrador han sido asignados al conductor  exitosamente" });
    }catch(error){
        console.error(error);
        res.status(500).json({msg:"Error al asignar los privilegios de administrador"});
    }
}

const RegistrarNuevoAdmin = async (req,res) =>{
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        telefono, 
        placaAutomovil,
        generoConductor, 
        cedula,
        email,
    } = req.body;
    try{
        // Comprobar si el email ya está registrado
        const verificarEmailBDD = await Conductores.findOne({email});
        const verificarRepresentateBDD = await Representantes.findOne({email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        }
        if (verificarRepresentateBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como representante" });
        }

        // Comprobar si la cédula ya está registrada
        const verificarCedulaBDD = await Conductores.findOne({cedula});
        const verificarCedulaRepresentanteBDD = await Representantes.findOne({cedula});
        if (verificarCedulaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los conductores" });
        };
        if (verificarCedulaRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los representantes" });
        };

        // Comprobar si la ruta ya está asignada
        const verificarRutaBDD = await Conductores.findOne({rutaAsignada});
        if (verificarRutaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la ruta ya se encuentra asignada" })
        } 

        // Comprobar si el telefono ya está registrado
        const verificarTelefonoBDD = await Conductores.findOne({telefono});
        const verificarTelefonoRepresentanteBDD = await Representantes.findOne({telefono});
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado en los conductores" });
        };
        if (verificarTelefonoRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado en los representantes" });
        }

        // Comprobar si la placa ya está registrada
        const verificarPlacaBDD = await Conductores.findOne({placaAutomovil});
        if (verificarPlacaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la placa ya se encuentra registrada" })
        };

        const conductorAdmin = await Conductores.findById(req.user.id);
        if (!conductorAdmin) return res.status(404).json({ msg_registro_conductor: "Lo sentimos, el conductor no se encuentra registrado" });

        // Crear un nuevo conductor con los datos proporcionados
        const nuevoConductor = new Conductores({
            nombre,
            apellido,
            telefono, 
            generoConductor,
            rutaAsignada: conductorAdmin.rutaAsignada,
            sectoresRuta: conductorAdmin.sectoresRuta,
            institucion: conductorAdmin.institucion,
            placaAutomovil,
            cedula,
            email,
            roles: ["conductor", "admin"]
        });

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {    
            const file = req.files.fotografiaDelConductor;

            try {
                // Subir la imagen a Cloudinary con el nombre del conductor como public_id
                const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                    public_id: `${nombre}_${apellido}`.replace(/\s+/g, '_'),
                    folder: "conductores"
                });

                // Guardar la URL de la imagen en la base de datos
                nuevoConductor.fotografiaDelConductor = result.secure_url;

                // Eliminar el archivo local después de subirlo
                await fs.unlink(file.tempFilePath);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_registro_conductor: "Error al subir la imagen" });
            }
        } else {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debes subir una imagen" });
        }


        // Generar una contraseña aleatoria
        const randomPassword = crypto.randomBytes(8).toString('hex');

        // Encriptar la contraseña antes de guardarla
        nuevoConductor.password = await nuevoConductor.encrypPassword(randomPassword);

        //No se crea un token de confirmación, ya que, al conductor solo se le necesita enviar un correo para que se diriga a su cuenta
        try {
            // Conductor logeado 
            const conductorAdmin = await Conductores.findById(req.user.id);
            //Aviso al nuevo coordinador de rutas
            await nuevoAdministrador(nuevoConductor.email, nuevoConductor.nombre, nuevoConductor.apellido, 
                randomPassword, nuevoConductor.rutaAsignada, nuevoConductor.sectoresRuta, conductorAdmin.nombre, conductorAdmin.apellido);
            // Guardar el nuevo conductor en la base de datos
            await nuevoConductor.save();

            //Quitar los privilegios de administrador al conductor que realizó la acción
            const index = conductorAdmin.roles.indexOf("admin");
            //Eliminar el rol de administrador
            if (index > -1) {
                conductorAdmin.roles.splice(index, 1);
            }
            //Guardar los cambios en la base de datos del conductor administrador saliente
            await conductorAdmin.save();

            // Actualizar los estudiantes que tienen la misma ruta asignada
            const estudiantes = await Estudiantes.find({ruta:nuevoConductor.rutaAsignada});
            const cantidadEstudiantes = estudiantes.length
            if(cantidadEstudiantes > 0){
                for (const estudiante of estudiantes) {
                    await Estudiantes.findByIdAndUpdate(estudiante._id, { conductor: nuevoConductor._id });
                    const estudianteRegistrado = {idEstudiante: estudiante._id, nombreEstudiante: estudiante.nombre, apellidoEstudiante: estudiante.apellido, nivelEscolarEstudiante: estudiante.nivelEscolar, paraleloEstudiante: estudiante.paralelo, cedulaEstudiante: estudiante.cedula} 
                    nuevoConductor.estudiantesRegistrados.push(estudianteRegistrado); 
                    for (const representanteId of estudiante.representantes){
                        const representante = await Representantes.findById(representanteId); 
                        if(representante){
                            await cambioConductor(representante.email, representante.nombre, representante.apellido, nuevoConductor.rutaAsignada, nuevoConductor.nombre, nuevoConductor.apellido)
                        }
                    }
                }  
                nuevoConductor.numeroEstudiantes = cantidadEstudiantes;
            }

            //Información a los conductores que se ha registrado un nuevo administrador
            const conductores = await Conductores.find({roles: 'conductor'});
            for(const conductor of conductores){
                await cambioAdmin(nuevoConductor.nombre, nuevoConductor.apellido, conductor.email, conductor.nombre, conductor.apellido); 
            }

            res.status(200).json({ 
                msg_registro_conductor: "Conductor registrado exitosamente", 
                nuevoAdmin: nuevoConductor
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg_registro_conductor: "Error al reemplazar al conductor administrador" });
        }
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al registrar el conductor administrador",
            error: error.message
        });
    }
}

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

export {
    RegistroDeLosConductores,
    BuscarConductorRuta,
    ListarConductor,
    ActualizarRutasYSectoresId,
    EliminarConductor, 
    VisualizarPerfil, 
    ActualizarInformacionAdmin, 
    AsignarPrivilegiosDeAdmin, 
    RegistrarNuevoAdmin, 
    ActualizarPassword, 
    ReemplazoTemporal, 
    ReemplazoPermanente
};