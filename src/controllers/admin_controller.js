import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import {enviarCorreoConductor, actualizacionDeConductor, eliminacionDelConductor} from "../config/nodemailer.js"; 
import { createToken } from '../middlewares/autho.js';
import crypto from 'crypto';

const RegistroDeLosConductores = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombreConductor,
        apellidoConductor,
        numeroDeRutaAsignada, 
        sectoresDeLaRuta,
        emailDelConductor,
    } = req.body;

    // Comprobar si el email ya está registrado
    const verificarEmailBDD = await Conductores.findOne({ emailDelConductor });
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    }

    // Crear un nuevo conductor con los datos proporcionados
    const nuevoConductor = new Conductores(req.body);

    // Verificar si se envió un archivo de imagen
    if (req.files && req.files.fotografiaDelConductor) {
        const file = req.files.fotografiaDelConductor;

        try {
            // Subir la imagen a Cloudinary con el nombre del conductor como public_id
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                public_id: `conductores/${nombreConductor} ${apellidoConductor}`,
                folder: "conductores"
            });

            // Guardar la URL de la imagen en la base de datos
            nuevoConductor.fotografiaDelConductor = result.secure_url;

            // Eliminar el archivo local después de subirlo
            await fs.unlink(file.tempFilePath);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al subir la imagen" });
        }
    }

    // Generar una contraseña aleatoria
    const randomPassword = crypto.randomBytes(8).toString('hex');

    // Encriptar la contraseña antes de guardarla
    nuevoConductor.passwordParaElConductor = await nuevoConductor.encrypPassword(randomPassword);
    await enviarCorreoConductor(emailDelConductor, randomPassword, numeroDeRutaAsignada, sectoresDeLaRuta); 

    //No se crea un token de confirmación, ya que, al conductor solo se le necesita enviar un correo para que se diriga a su cuenta
    try {
        // Guardar el nuevo conductor en la base de datos
        await nuevoConductor.save();
        res.status(201).json({ msg_registro_conductor: "Conductor registrado exitosamente", nuevoConductor});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_registro_conductor: "Error al registrar el conductor" });
    }
};

const LoginAdministrador = async (req, res) => {
    //Toma de los datos del administrador
    const {emailAdministrador, passwordAdministrador} = req.body;
    //Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.satus(400).json({msg:"Lo sentimos debes llenar todos los campos"})
    //¿Qué sucede si el email o la contraseña no son correctas?
    if(emailAdministrador !== process.env.ADMIN_EMAIL) return res.status(400).json({msg:"Lo sentimos, el email no es correcto"})
    if(passwordAdministrador !== process.env.ADMIN_PASSWORD) return res.status(400).json({msg:"Lo sentimos, la contraseña no es correcta"})
    // ¿Qué sucede si las creedenciales son correctas?
    if (emailAdministrador === process.env.ADMIN_EMAIL && passwordAdministrador === process.env.ADMIN_PASSWORD) {
        // Crear un token JWT con un campo adicional que indique que el usuario es un administrador
        const token = createToken({ email: emailAdministrador, role: 'admin' });
        // Enviar el token al cliente
        return res.status(200).json({ token, msg_login_admin: "Bienvenido administrador" });
    }
};

const BuscarConductor = async (req, res) => {
    //Obtener el id de los parámetros de la URL
    const { id } = req.params;

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findById(id).select("-updatedAt -createdAt -__v");
    if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    //Mensaje de exito
    res.status(200).json({ msg: `El conductor ${conductor.nombreConductor} ${conductor.apellidoConductor} se ha encontrado exitosamente`, conductor});
};

const BuscarConductorRuta = async (req, res) => {
    try {
        // Obtener el número de la ruta de los parámetros de la URL
        const { numeroDeRutaAsignada } = req.params;

        // Verificación de la existencia de la ruta
        const conductores = await Conductores.find({ numeroDeRutaAsignada }).select("-updatedAt -createdAt -__v");
        if (conductores.length === 0) {
            return res.status(400).json({ msg: "Lo sentimos, no se ha encontrado ningún conductor trabajando en la Unidad Educativa Particular EMAÚS con esa ruta" });
        }

        // Mensaje de éxito
        res.status(200).json({ msg: `El conductor de la ruta ${numeroDeRutaAsignada} se han encontrado exitosamente`, conductores });
    } catch (error) {

        res.status(500).json({ msg: "Error al buscar conductores por ruta", error: error.message });
    }
}

const ListarConductor = async (req, res) => {
    //Obtener todos los conductores
    const conductores = await Conductores.find().select("-updatedAt -createdAt -__v");
    //Validación de que existan conductores
    if (conductores.length === 0) return res.status(400).json({msg:"El administrador no ha registrado a ningún conductor"});
    //Mensaje de exito
    res.status(200).json({ msg: "Los conductores se han encontrado exitosamente", conductores});
}

const ActualizarRutasYSectores = async (req, res) => {
    const { numeroDeRutaAsignada, sectoresDeLaRutaAsignada, numeroDeCedula } = req.body;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({ numeroDeCedula });
    if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    // Para conocer el nombre del conductor que posee ese número de cédula
    const { nombreConductor, apellidoConductor} = conductor;

    // Actualización de los datos
    await Conductores.findOneAndUpdate(
        { numeroDeCedula },
        { numeroDeRutaAsignada, sectoresDeLaRutaAsignada },
        { new: true } // Esta opción devuelve el documento actualizado
    );

    //Envio del correo al conductor 
    await actualizacionDeConductor(conductor.emailDelConductor, numeroDeRutaAsignada, sectoresDeLaRutaAsignada);

    res.status(200).json({
        msg: `La ruta y sectores objetivo del conductor ${nombreConductor} ${apellidoConductor} han sido actualizados exitosamente`
    });
};

const EliminarConductor = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const { id } = req.params;
    
    //Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({id});
    if(!conductor) return res.status(400).json({msg:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
    
    //Eliminación del conductor
    await Conductores.findOneAndDelete({id});

    //Envio del correo al conductor
    await eliminacionDelConductor(conductor.emailDelConductor, conductor.nombreConductor, conductor.apellidoConductor);

    //Mensaje de exito
    res.status(200).json({msg:`El conductor ${conductor.nombreConductor} ${conductor.apellidoConductor} ha sido eliminado exitosamente`})
};

export {
    RegistroDeLosConductores,
    LoginAdministrador,
    BuscarConductor, 
    BuscarConductorRuta,
    ListarConductor,
    ActualizarRutasYSectores, 
    EliminarConductor
};