import Conductores from '../models/Conductores.js';
import { createToken } from '../middlewares/autho.js';
import {recuperacionContrasenia} from "../config/nodemailer.js"; 
/*import Representantes from '../models/Representantes.js';
import {recuperacionContraseniaRepresentante} from '../config/nodemailer.js';*/

// Logeo de todos los roles
const Login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Verificación de los campos vacíos
        if (!email || !password ||  !role) {
            return res.status(400).json({ msg_autenticacion: "Lo sentimos, debes llenar todos los campos" });
        }

        // Verificación del rol
        if (role !== 'conductor' && role !== 'representante' && role !== 'admin') {
            return res.status(400).json({ msg_autenticacion: "Dicho rol no es una entidad participativa en el sistema" });
        };   

        // Verificación en la base de datos del conductor
        const conductor = await Conductores.findOne({ email: email }).select("-createdAt -updatedAt -__v");
        if (conductor) {
            // Verificar el rol seleccionado
            if (!conductor.roles.includes(role)) {
                return res.status(403).json({ msg: "No tiene permisos para acceder con este rol" });
            }

            // Verificación de la contraseña
            const verificacionContrasenia = await conductor.matchPassword(password);
            // Si la contraseña es correcta se crea el token JWT
            if (verificacionContrasenia) {
                // Verificar si el conductor debe cambiar su contraseña
                if (conductor.requiereCambioContrasenia === true) {
                    return res.status(403).json({ 
                        msg: "Debe cambiar su contraseña antes de continuar.", 
                        redirigir: true 
                    });
                };
                const token = createToken({ id: conductor._id, email: conductor.email, role: role });
                return res.status(200).json({ token, msg_login_conductor: `Bienvenido ${role} ${conductor.nombre} ${conductor.apellido}`, rol: role /*, conductor: conductor*/ });
            } else {
                return res.status(400).json({ msg: "Contraseña incorrecta" });
            }
        }

        // Verificación en la base de datos del representante
        /*const representante = await Representantes.findOne({ email: email }).select("-createdAt -updatedAt -__v");
        if (representante) {
            // Verificación de la contraseña
            const verificacionContrasenia = await representante.matchPassword(password);
            // Si la contraseña es correcta se crea el token JWT
            if (verificacionContrasenia) {
                const token = createToken({ id: representante._id, email: representante.email, role: 'representante' });
                return res.status(200).json({ token, msg_login_representante: `Bienvenido representante ${representante.nombre} ${representante.apellido}`, rol:"representante", representante: representante });
            } else {
                return res.status(400).json({ msg: "Contraseña incorrecta" });
            }
        }*/

        // Si no se encuentra el usuario
        return res.status(400).json({ msg: "El usuario no se encuentra registrado" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al tratar de logearse" });
    }
};

const RecuperacionDeContrasenia = async (req, res) => {
    try{
        //Recepción del email del conductor
        const {email} = req.body;

        //Datos del admin para el correo de confirmación
        const admin = await Conductores.findOne({ roles: { $in: ['admin'] } });

        //Verificación de que el email no se encuentre vacío
        if (Object.values(req.body).includes("")) return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, debes llenar todos los campos"})
        const conductor = await Conductores.findOne({email: email});
        //Verificación de que el conductor exista
        if(conductor){
            //Creación del token para la recuperación de la contraseña
            const token = conductor.crearToken('recuperacion');
            await conductor.save();
            //Envío del correo de recuperación de la contraseña
            await recuperacionContrasenia(admin.email, conductor.email, conductor.nombre, conductor.apellido, token, admin.apellido, admin.nombre);
            return res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
        }

        // Verificación en la base de datos del representante
        /*const representante = await Representantes.findOne({ email });
        if(representante){
            //Creación del token para la recuperación de la contraseña
            const token = representante.crearToken('recuperacion');
            await representante.save();
            //Envío del correo de recuperación de la contraseña
            await recuperacionContraseniaRepresentante(representante.email, representante.nombre, representante.apellido, token, admin.apellido, admin.nombre);
            return res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
        }*/
        return res.status(404).json({msg_recuperacion_contrasenia:"El usuario no se encuentra registrado"});
    }catch(error){
        console.error(error);
        return res.status(500).json({ msg_recuperacion_contrasenia:"Error al recuperar la contraseña"});
    }
}

const ComprobarTokenPassword = async (req, res) => {
    try{
        //Recepción del token
        const tokenURL = req.params.token;
        
        //Verificación de que el token sea válido
        if(!tokenURL) return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, el token se encuentra vacío"});
        
        // Verificar si el token pertenece a un conductor
        const conductor = await Conductores.findOne({ token: tokenURL });
        if (conductor) {
            // Verificar si el token ha expirado
            if (conductor.tokenExpiracion <= Date.now()) {
                return res.status(400).json({ msg_recuperacion_contrasenia: "Lo sentimos, el token ha expirado" });
            }

            // Si el token es válido
            return res.status(200).json({ msg_recuperacion_contrasenia: "Token confirmado, ya puedes crear tu nuevo password" });
        }

        // Verificar si el token pertenece a un representante
        /*const representante = await Representantes.findOne({ token: tokenURL });
        if (representante) {
            // Verificar si el token ha expirado
            if (representante.tokenExpiracion <= Date.now()) {
                return res.status(400).json({ msg_recuperacion_contrasenia: "Lo sentimos, el token ha expirado" });
            }

            // Si el token es válido
            return res.status(200).json({ msg_recuperacion_contrasenia: "Token confirmado, ya puedes crear tu nuevo password" });
        }*/
        return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, el token no coincide con ningún usuario"});
    }catch(error){
        console.error(error);
        return res.status(500).json({msg:"Error al comprobar el token"});
    }
}

const NuevaPassword= async (req, res) => {
    try{
        //Recepción de la nueva contraseña
        const {passwordActual, passwordActualConfirm} = req.body;
        const tokenURL = req.params.token;
        //Verificación de que no haya campos vacíos
        if (Object.values(req.body).includes("")) {
            return res.status(400).json({msg_recuperacion_contrasenia: "Lo sentimos, debes llenar todos los campos"});
        }

        //Verificación de que el token sea válido
        if(!tokenURL) return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, el token se encuentra vacío"});

        //Verificación de que la contraseña y su confirmación coincidan
        if(passwordActual !== passwordActualConfirm){
            return res.status(400).json({msg_recuperacion_contrasenia: "Lo sentimos, la contraseña nueva y su confirmación no coinciden"});
        }

        //Verificación de que exista un conductor con el token
        const conductor = await Conductores.findOne({token:tokenURL});
        if(conductor){
            conductor.password = await conductor.encrypPassword(passwordActual);
            //Eliminar el token de la base de datos para que no se pueda volver a usar 
            conductor.token = null;
            await conductor.save();
            return res.status(200).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
        };
        
        //Verificación de que exista un representante con el token 
        /*const representante = await Representantes.findOne({token: tokenURL});
        if(representante) {
            representante.password = await representante.encrypPassword(passwordActual);
            //Eliminar el token de la base de datos para que no se pueda volver a usar 
            representante.token = null;
            await representante.save();
            return res.status(200).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
        }*/
        return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, el token no coincide con ningún usuario, por lo que no se ha actualizado la contrasenia"});

    }catch(error){
        console.error(error);
        return res.status(500).json({msg_recuperacion_contrasenia:"Error al comprobar el token"});
    }
    
}

const ConfirmacionCorreoNuevo = async (req, res) => {
    try{
        //Recepcion del token proporcionado por la URL
        const { token } = req.params;

        // Buscar conductor por token
        const conductor = await Conductores.findOne({ tokenEmail: token });
        if (conductor) {
            // Verificar si el token ha expirado
            if (conductor.tokenEmailExpiracion <= Date.now()) {
                return res.status(400).json({ msg: "Lo sentimos, el token ha expirado. Solicite un nuevo cambio de correo." });
            }; 

            // Actualizar el email
            conductor.email = conductor.emailTemporal;
            conductor.tokenEmail = null;
            conductor.emailTemporal = null;
            conductor.tokenEmailExpiracion = null;

            // Guardar los cambios en la base de datos
            await conductor.save();
            return res.status(200).json({ msg: "Correo electrónico actualizado exitosamente, puede logearse con su nuevo email" });
        }

        // Buscar representante por token
        /*const representante = await Representantes.findOne({ tokenEmail: token });
        if (representante) {
            // Verificar si el token ha expirado
            if (representante.tokenEmailExpiracion <= Date.now()) {
                return res.status(400).json({ msg: "Lo sentimos, el token ha expirado. Solicite un nuevo cambio de correo." });
            }

            // Actualizar el email
            representante.email = representante.emailTemporal;
            representante.tokenEmail = null;
            representante.emailTemporal = null;
            representante.tokenEmailExpiracion = null;

            // Guardar los cambios en la base de datos
            await representante.save();
            return res.status(200).json({ msg: "Correo electrónico actualizado exitosamente, puede logearse con su nuevo email" });
        }*/

        return res.status(400).json({ msg: "El token no coincide con ningún usuario" }); 
    }catch(error){
        console.error(error);
        return res.status(500).json({msg:"Error al comprobar el token"});
    }
};

// Para el primer inicio de sesión
const CambiarPasswordPorEmail = async (req, res) => {
    const { email, passwordActual, passwordActualConfirm } = req.body;

    try {
        // Buscar al conductor por email
        const conductor = await Conductores.findOne({ email:email });
        if (!conductor) {
            return res.status(404).json({ msg_cambio_contrasenia: "Usuario no encontrado" });
        }

        // Verificar que las contraseñas coincidan
        if (passwordActual !== passwordActualConfirm) {
            return res.status(400).json({ msg_cambio_contrasenia: "Las contraseñas no coinciden" });
        }

        // Encriptar la nueva contraseña
        conductor.password = await conductor.encrypPassword(passwordActual);

        // Restablecer el campo `requiereCambioContrasenia`
        conductor.requiereCambioContrasenia = false;

        // Guardar los cambios en la base de datos
        await conductor.save();

        res.status(200).json({ msg_cambio_contrasenia: "La contraseña se ha actualizado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg_cambio_contrasenia: "Error al cambiar la contraseña." });
    }
};
export { Login, RecuperacionDeContrasenia, ComprobarTokenPassword, NuevaPassword, ConfirmacionCorreoNuevo, CambiarPasswordPorEmail};