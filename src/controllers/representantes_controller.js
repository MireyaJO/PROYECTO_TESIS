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

const ConfirmacionCorreo = async (req, res) => {
    //Obtenencion del token de la url 
    const token = req.params.token;
    try {
        // Verificar si el token es válido|
        if(!token) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
        const representante= await Representantes.findOne({token:token})

        // Verificaicón de la confirmación de la cuenta
        if(representante?.confirmacionEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
        
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

export {
    RegistroDeRepresentantes, 
    ConfirmacionCorreo, 
    LoginRepresentante
}
