import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import Estudiantes from '../models/Conductor.js'
import Representantes from '../models/Representantes.js';
import {enviarCorreoConductor, actualizacionDeConductor, eliminacionDelConductor,  informacionEliminacion, cambioConductor} from "../config/nodemailer.js"; 
import crypto from 'crypto';

// Registros de los conductores
const RegistroDeLosConductores = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        rutaAsignada, 
        sectoresRuta,
        telefono, 
        placaAutomovil,
        cedula,
        email,
    } = req.body;
    try{
        // Comprobar si el email ya está registrado
        const verificarEmailBDD = await Conductores.findOne({email});
        const cerificarRepresentateBDD = await Representantes.findOne({email});
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        }

        if (cerificarRepresentateBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como representante" });
        }

        // Comprobar si la cédula ya está registrada
        const verificarCedulaBDD = await Conductores.findOne({cedula});
        if (verificarCedulaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada" })
        };

        // Comprobar si la ruta ya está asignada
        const verificarRutaBDD = await Conductores.findOne({rutaAsignada});
        if (verificarRutaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la ruta ya se encuentra asignada" })
        } 

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

        // Crear un nuevo conductor con los datos proporcionados
        const nuevoConductor = new Conductores(req.body);

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
            await enviarCorreoConductor(email, randomPassword, rutaAsignada, sectoresRuta); 
            // Guardar el nuevo conductor en la base de datos
            await nuevoConductor.save();

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

            res.status(200).json({ msg_registro_conductor: "Conductor registrado exitosamente", nuevoConductor});
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg_registro_conductor: "Error al registrar el conductor" });
        }
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
        const conductores = await Conductores.find({rutaAsignada}).select("-updatedAt -createdAt -__v");
        if (conductores.length === 0) {
            return res.status(400).json({ msg: "Lo sentimos, no se ha encontrado ningún conductor trabajando en la Unidad Educativa Particular EMAÚS con esa ruta" });
        }

        // Mensaje de éxito
        res.status(200).json({ msg_buscar_conductor_ruta: `El conductor de la ruta ${rutaAsignada} se han encontrado exitosamente`, conductores });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg_buscar_conductor_ruta: "Error al buscar conductores por ruta", error: error.message });
    }
}

// Listar todos los conductores de la Unidad Educativa Particular EMAÚS
const ListarConductor = async (req, res) => {
    try{
        //Obtener todos los conductores
        const conductores = await Conductores.find().select("-updatedAt -createdAt -__v");
        //Validación de que existan conductores
        if (conductores.length === 0) return res.status(400).json({msg:"El administrador no ha registrado a ningún conductor"});
        //Mensaje de exito
        res.status(200).json({ msg_listar_conductores: "Los conductores se han encontrado exitosamente", conductores});
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al listar los conductores",
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

    try{
        // Verificación de los campos vacíos
        if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

        // Para conocer el nombre del conductor que posee ese id
        const {nombre, apellido} = conductor;

        // Actualización de los datos
        await Conductores.findOneAndUpdate(
            { _id: id },
            { rutaAsignada, sectoresRuta},
            // Esta opción devuelve el documento actualizado
            { new: true } 
        );

        //Envio del correo al conductor 
        await actualizacionDeConductor(conductor.email, rutaAsignada, sectoresRuta);

        res.status(200).json({
            msg: `La ruta y sectores objetivo del conductor ${nombre} ${apellido} han sido actualizados exitosamente`
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al actualizar las rutas y sectores de los conductores",
            error: error.message
        });
    }
}

//Eliminación de un conductor
const EliminarConductor = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const {id} = req.params;
   try{
        //Verificación de la existencia del conductor
        const conductor = await Conductores.findById({_id: id});
        if(!conductor) return res.status(400).json({msg:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
        if (conductor.numeroEstudiantes > 0) {
            // Recorrer el array de los estudiantes que tienen el id de conductor que se desea eliminar
            for (const estudiantes of conductor.estudiantesRegistrados) {
                const estudiante = await Estudiantes.findById(estudiantes.idEstudiante);
                if (estudiante) {
                    //Se actualiza el campo conductor del estudiante a "null"
                    estudiante.conductor = null;
                    await estudiante.save();
                    //Recorrer el array de los representates de cada estudiante 
                    for (const representanteId of estudiante.representantes){
                        const representante = await Representantes.findById(representanteId); 
                        if(representante){
                            //Envió del correo al representante 
                            await informacionEliminacion(representante.email, representante.nombre, representante.apellido, conductor.rutaAsignada, conductor.nombre, conductor.apellido);
                        }
                    }
                }
            }
        } 
        
        //Eliminar la imagen en Cloudinary 
        const publicId = `conductores/${conductor.nombre}_${conductor.apellido}`;
        try{
            await cloudinary.v2.uploader.destroy(publicId);
        }catch{
            console.error("Error al eliminar la imagen en Cloudinary");
            return res.status(500).json({msg:"Error al eliminar la imagen"}); 
        }

        //Eliminación del conductor en la base de datos
        await Conductores.findOneAndDelete({_id: id});

        //Envio del correo al conductor
        await eliminacionDelConductor(conductor.email, conductor.nombre, conductor.apellido);
        
        //Mensaje de exito
        res.status(200).json({msg:`El conductor ${conductor.nombre} ${conductor.apellido} ha sido eliminado exitosamente`}); 
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al eliminar el conductor",
            error: error.message
        });
   }
};

// Perfil quemado del administrador
const perfilAdministrador = {
    nombre: "Mireya",
    apellido: "Garcia",
    email: process.env.ADMIN_EMAIL,
    telefono: "0964531123",
    rol: "Administrador",
    institucion: "Unidad Educativa Particular EMAÚS"
};

const VisualizarPerfil = async (req, res)=>{
    try{
        res.status(200).json({
            msg_admin: "Perfil del administrador encontrado exitosamente",
            administrador: perfilAdministrador
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al visualizar el perfil del administrador",
            error: error.message
        });
    }
}

export {
    RegistroDeLosConductores,
    BuscarConductorRuta,
    ListarConductor,
    ActualizarRutasYSectoresId,
    EliminarConductor, 
    VisualizarPerfil
};