import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import enviarCorreoConductor from "../config/nodemailer.js"; 
import { createToken } from '../middlewares/autho.js';

const RegistroDeLosConductores = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombreConductor,
        apellidoConductor,
        numeroDeCedula,
        numeroDeLaPlacaDelAutomovil, 
        numeroDeRutaAsignada, 
        sectoresDeLaRutaAsignada,
        institucionALaQueSeRealizaElReco,
        emailDelConductor,
        passwordParaElConductor
    } = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Comprobar el tamaño de la cedula
    if(numeroDeCedula.toString().length !== 10){
        return res.status(400).json({ msg: "Lo sentimos, el número de cédula debe tener 10 dígitos" });
    }

    //Comparar el tamaño de la placa
    if(numeroDeLaPlacaDelAutomovil.length !== 7){
        return res.status(400).json({ msg: "Lo sentimos, el número de placa debe tener 7 dígitos" });
    }

    // Comprobar si el email ya está registrado
    const verificarEmailBDD = await Conductores.findOne({ emailDelConductor });
    if (verificarEmailBDD) {
        return res.status(400).json({ msg: "Lo sentimos, el email ya se encuentra registrado" });
    }

    // Comprobar si el email está bien escrito y tiene un dominio permitido
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/;
    if (!emailRegex.test(emailDelConductor)) {
        return res.status(400).json({ msg: "Lo sentimos, el email debe ser de dominio gmail, outlook o hotmail y estar bien escrito" });
    }

    //Verificación del nombre de la institución en la que se esta trabajando
    if(institucionALaQueSeRealizaElReco !== "Unidad Educativa Particular EMAÚS"){
        return res.status(400).json({ msg: "Lo sentimos, el sistema es solo para los recorridos de la Unidad Educativa Particular EMAÚS" });
    }

    // Crear un nuevo conductor con los datos proporcionados
    const nuevoConductor = new Conductores(req.body);

    // Verificar si se envió un archivo de imagen
    if (req.files && req.files.fotografiaDelEstudiante) {
        const file = req.files.fotografiaDelEstudiante;

        try {
            // Subir la imagen a Cloudinary con el nombre del conductor como public_id
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                public_id: `conductores/${nombreConductor} ${apellidoConductor}`,
                folder: "conductores"
            });

            // Guardar la URL de la imagen en la base de datos
            console.log(result.secure_url);
            nuevoConductor.fotografiaDelEstudiante = result.secure_url;

            // Eliminar el archivo local después de subirlo
            await fs.unlink(file.tempFilePath);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Error al subir la imagen" });
        }
    }

    //Verificación de la contraseña
    if(passwordParaElConductor.length < 6 || passwordParaElConductor.length >10){
        return res.status(400).json({ msg: "Lo sentimos, la contraseña debe tener al menos 6 caracteres" });
    }
    
    //La contraserña debe tener al menos 2 caracteres especiales 
    const caracteresEspeciales = /[^a-zA-Z0-9]/g;
    const specialCharCount = (passwordParaElConductor.match(caracteresEspeciales) || []).length;
    if(specialCharCount < 2){
        return res.status(400).json({ msg: "Lo sentimos, la contraseña necesita minimo dos caracteres especiales" })
    };

    // Encriptar la contraseña antes de guardarla
    nuevoConductor.passwordParaElConductor = await nuevoConductor.encrypPassword(passwordParaElConductor);
    enviarCorreoConductor(emailDelConductor, passwordParaElConductor, numeroDeRutaAsignada, sectoresDeLaRutaAsignada); 

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
        return res.status(200).json({ token, msg_admin: "Bienvenido administrador" });
    }
};

const BuscarConductor = async (req, res) => {
    //Pbtener el id de los parámetros de la URL
    const { id } = req.params;

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findById(id);
    if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    //Mensaje de exito
    res.status(200).json({ msg: `El conductor ${conductor.nombreConductor} se ha encontrado exitosamente`, conductor});
};

const ActualizarRutasYSectores = async (req, res) => {
    const { numeroDeRutaAsignada, sectoresDeLaRutaAsignada, numeroDeCedula } = req.body;

    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });

    // Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({ numeroDeCedula });
    if (!conductor) return res.status(400).json({ msg: "Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS" });

    // Para conocer el nombre del conductor que posee ese número de cédula
    const { nombreConductor } = conductor;

    // Actualización de los datos
    await Conductores.findOneAndUpdate(
        { numeroDeCedula },
        { numeroDeRutaAsignada, sectoresDeLaRutaAsignada },
        { new: true } // Esta opción devuelve el documento actualizado
    );

    res.status(200).json({
        msg: `La ruta y sectores objetivo del conductor ${nombreConductor} han sido actualizados exitosamente`
    });
};

const EliminarConductor = async (req, res) => {
    // Obtener el ID de los parámetros de la URL
    const { id } = req.params;
    
    //Verificación de la existencia del conductor
    const conductor = await Conductores.findOne({numeroDeCedula});
    if(!conductor) return res.status(400).json({msg:"Lo sentimos, el conductor no se encuentra trabajando en la Unidad Educativa Particular EMAÚS"})
    
    //Eliminación del conductor
    await Conductores.findOneAndDelete({numeroDeCedula});

    //Mensaje de exito
    res.status(200).json({msg:`El conductor ${conductor.nombreConductor} ha sido eliminado exitosamente`})
};

export {
    RegistroDeLosConductores,
    LoginAdministrador,
    BuscarConductor, 
    ActualizarRutasYSectores, 
    EliminarConductor
};