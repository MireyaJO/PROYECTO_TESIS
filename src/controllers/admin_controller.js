import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import {enviarCorreoConductor, actualizacionDeConductor, eliminacionDelConductor} from "../config/nodemailer.js"; 
import { createToken } from '../middlewares/autho.js';
import crypto from 'crypto';

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

    // Comprobar si el email ya está registrado
    const verificarEmailBDD = await Conductores.findOne({email});
    if (verificarEmailBDD) {
        return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado" });
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
    };

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
                public_id: `conductores/${nombre} ${apellido}`,
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
    await enviarCorreoConductor(email, randomPassword, rutaAsignada, sectoresRuta); 

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
    const {emailAdmin, passwordAdmin} = req.body;
    //Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.satus(400).json({msg:"Lo sentimos debes llenar todos los campos"})
    //¿Qué sucede si el email o la contraseña no son correctas?
    if(emailAdmin !== process.env.ADMIN_EMAIL) return res.status(400).json({msg:"Lo sentimos, el email no es correcto"})
    if(passwordAdmin !== process.env.ADMIN_PASSWORD) return res.status(400).json({msg:"Lo sentimos, la contraseña no es correcta"})
    // ¿Qué sucede si las creedenciales son correctas?
    if (emailAdmin === process.env.ADMIN_EMAIL && passwordAdmin === process.env.ADMIN_PASSWORD) {
        // Crear un token JWT con un campo adicional que indique que el usuario es un administrador
        const token = createToken({ email: emailAdmin, role: 'admin' });
        // Enviar el token al cliente
        return res.status(200).json({ token, msg_login_admin: "Bienvenido administrador" });
    }
};

const BuscarConductor = async (req, res) => {
    //Obtener el id de los parámetros de la URL
    const { id } = req.params;

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findById(id).select("-updatedAt -createdAt -__v");
    if (!conductor) return res.status(400).json({ msg_buscar_conductor: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    //Mensaje de exito
    res.status(200).json({ msg: `El conductor ${conductor.nombre} ${conductor.apellido} se ha encontrado exitosamente`, conductor});
};

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

        res.status(500).json({ msg_buscar_conductor_ruta: "Error al buscar conductores por ruta", error: error.message });
    }
}

const ListarConductor = async (req, res) => {
    //Obtener todos los conductores
    const conductores = await Conductores.find().select("-updatedAt -createdAt -__v");
    //Validación de que existan conductores
    if (conductores.length === 0) return res.status(400).json({msg:"El administrador no ha registrado a ningún conductor"});
    //Mensaje de exito
    res.status(200).json({ msg_listar_conductores: "Los conductores se han encontrado exitosamente", conductores});
}

const ActualizarRutasYSectores = async (req, res) => {
    const {rutaAsignada, sectoresRuta, cedula} = req.body;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({cedula});
    if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    // Para conocer el nombre del conductor que posee ese número de cédula
    const {nombre, apellido} = conductor;

    // Actualización de los datos
    await Conductores.findOneAndUpdate(
        { cedula },
        { rutaAsignada, sectoresRuta},
        // Esta opción devuelve el documento actualizado
        { new: true } 
    );

    //Envio del correo al conductor 
    await actualizacionDeConductor(conductor.email, rutaAsignada, sectoresRuta);

    res.status(200).json({
        msg: `La ruta y sectores objetivo del conductor ${nombre} ${apellido} han sido actualizados exitosamente`
    });
};

const EliminarConductor = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const {id} = req.params;
    
    //Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({id});
    if(!conductor) return res.status(400).json({msg:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
    
    //Eliminación del conductor
    await Conductores.findOneAndDelete({id});

    //Envio del correo al conductor
    await eliminacionDelConductor(conductor.email, conductor.nombre, conductor.apellido);

    //Mensaje de exito
    res.status(200).json({msg:`El conductor ${conductor.nombre} ${conductor.apellido} ha sido eliminado exitosamente`})
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