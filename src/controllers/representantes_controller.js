import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Administrador.js';
import Estudiantes from '../models/Conductor.js';
import Representantes from '../models/Representantes.js';
import {createToken} from '../middlewares/autho.js';
import {confirmacionDeCorreoRepresentante} from '../config/nodemailer.js';

//Función para que los representantes puedan registrarse
const RegistroDeRepresentantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombre,
        apellido,
        telefono,
        cedula,
        email,
        password,
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

    // Comprobar si el telefono ya está registrado
    const verificarTelefonoBDD = await Conductores.findOne({telefono});
    if (verificarTelefonoBDD) {
        return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el telefono ya se encuentra registrado" })
    };

    // Crear un nuevo conductor con los datos proporcionados
    const nuevoRepresentante = new Representantes(req.body);  

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
        // Guardar el nuevo conductor en la base de datos
        await nuevoRepresentante.save();
        res.status(201).json({ msg_registro_representante: "Conductor registrado exitosamente", nuevoRepresentante});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_registro_representante: "Error al registrar el conductor" });
    }
}

const ConfirmacionCorreo = async (req, res) => {
    //Obtenencion del token de la url 
    const token = req.params.token;
    try {
        // Verificar si el token es válido|
        if(!token) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const representante= await Representantes.findOne({token:token})

        // Verificar si el representante ya ha confirmado su cuenta
        if (!representante?.token) {
            return res.status(404).json({ msg: "La cuenta ya ha sido confirmada" });
        }

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
        if (!Representantes) {
            return res.status(404).json({ msg_login_representante: "Lo sentimos, el conductor no se encuentra registrado" });
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

//Función para obtener el ID del representante autenticado
const ObtenerRepresentanteId = (req, res) => {
    res.json({ id: req.user.id });
};
export {
    RegistroDeRepresentantes, 
    ConfirmacionCorreo, 
    LoginRepresentante, 
    ObtenerRepresentanteId
}
