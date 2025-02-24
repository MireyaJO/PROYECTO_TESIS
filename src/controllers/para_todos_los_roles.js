import Conductores from '../models/Conductores.js';
import Estudiantes from '../models/Estudiantes.js';
import Representantes from '../models/Representantes.js';
import { createToken } from '../middlewares/autho.js';
import {recuperacionContrasenia} from "../config/nodemailer.js"; 
import {recuperacionContraseniaRepresentante} from '../config/nodemailer.js';
import crypto from 'crypto';

// Logeo de todos los roles
const Login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Verificación de los campos vacíos
        if (!email || !password ||  !role) {
            return res.status(400).json({ msg_autenticacion: "Lo sentimos, debes llenar todos los campos" });
        }

        // Verificación del rol
        if (role !== 'Conductor' && role !== 'Representante' && role !== 'Administrador') {
            return res.status(400).json({ msg_autenticacion: "Dicho rol no es una entidad participativa en el sistema" });
        };   

        // Verificación en la base de datos del conductor
        const conductor = await Conductores.findOne({ email: email });
        if (conductor) {
            // Verificar el rol seleccionado
            if (!conductor.roles.includes(role)) {
                return res.status(403).json({ msg: "No tiene permisos para acceder con este rol" });
            }

            // Verificación de la contraseña
            const verificacionContrasenia = await conductor.matchPassword(password);
            // Si la contraseña es correcta se crea el token JWT
            if (verificacionContrasenia) {
                const token = createToken({ id: conductor._id, email: conductor.email, role: role });
                return res.status(200).json({ token, msg_login_conductor: "Bienvenido", conductor: conductor });
            } else {
                return res.status(400).json({ msg: "Contraseña incorrecta" });
            }
        }

        // Verificación en la base de datos del representante
        const representante = await Representantes.findOne({ email: email });
        if (representante) {
            // Verificación de la contraseña
            const verificacionContrasenia = await representante.matchPassword(password);
            // Si la contraseña es correcta se crea el token JWT
            if (verificacionContrasenia) {
                const token = createToken({ id: representante._id, email: representante.email, role: 'representante' });
                return res.status(200).json({ token, msg_login_representante: "Bienvenido representante", representante: representante});
            } else {
                return res.status(400).json({ msg: "Contraseña incorrecta" });
            }
        }

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

        //Verificación de que el email no se encuentre vacío
        if (Object.values(req.body).includes("")) return res.status(400).json({msg_recuperacion_contrasenia:"Lo sentimos, debes llenar todos los campos"})
        const conductor = await Conductores.findOne({email: email});
        //Verificación de que el conductor exista
        if(conductor){
            //Creación del token para la recuperación de la contraseña
            const token = conductor.crearToken();
            conductor.token = token;

            //Envío del correo de recuperación de la contraseña
            await recuperacionContrasenia(conductor.email, conductor.nombre, conductor.apellido, token);
            await conductor.save();
            return res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
        }

        // Verificación en la base de datos del representante
        const representante = await Representantes.findOne({ email });
        if(representante){
            //Creación del token para la recuperación de la contraseña
            const token = representante.crearToken();
            representante.token = token;

            //Envío del correo de recuperación de la contraseña
            await recuperacionContraseniaRepresentante(representante.email, representante.nombre, representante.apellido, token);
            await representante.save();
            return res.status(200).json({ msg_recuperacion_contrasenia:"Correo de recuperación de contraseña enviado satisfactoriamente"})
        }
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
        
        //Verificación de que exista un conductor con el token
        const conductor = await Conductores.findOne({token:tokenURL});
        if(conductor?.token === tokenURL){
            await conductor.save();
            return res.status(200).json({msg_recuperacion_contrasenia:"Token confirmado, ya puedes crear tu nuevo password"})
        };
        
        //Verificación de que exista un representante con el token 
        const representante = await Representantes.findOne({token: tokenURL});
        if(representante?.token === tokenURL) {
            await representante.save()
            return res.status(200).json({msg_recuperacion_contrasenia:"Token confirmado, ya puedes crear tu nuevo password"})
        } 
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
        if(conductor?.token === tokenURL){
            conductor.password = await conductor.encrypPassword(passwordActual);
            conductor.token = null;
            await conductor.save();
            return res.status(200).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
        };
        
        //Verificación de que exista un representante con el token 
        const representante = await Representantes.findOne({token: tokenURL});
        if(representante?.token === tokenURL) {
            representante.password = await representante.encrypPassword(passwordActual);
            //Eliminar el token de la base de datos para que no se pueda volver a usar 
            representante.token = null;
            await representante.save();
            return res.status(200).json({msg_recuperacion_contrasenia: "La contraseña se ha actualizado satisfactoriamente, por favor vuelva a logearse"});
        } 
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
        const conductor = await Conductores.findOne({ token: token });
        if (conductor) {
            // Actualizar el email
            conductor.email = conductor.tokenEmail;
            conductor.token = null;
            //Almacenamiento temporal de el correo nuevo hasta que se confirme el cambio de correo
            conductor.tokenEmail = null;
        
            // Guardar los cambios en la base de datos
            await conductor.save();
            return res.status(200).json({ msg: "Correo electrónico actualizado exitosamente, puede logearse con su nuevo email" });
        }

        // Buscar representante por token
        const representante = await Representantes.findOne({token: token}); 
        if (representante) {
            // Actualizar el email
            representante.email = representante.tokenEmail;
            representante.token = null;
            //Almacenamiento temporal de el correo nuevo hasta que se confirme el cambio de correo
            representante.tokenEmail = null;
    
            // Guardar los cambios en la base de datos
            await representante.save();
            return res.status(200).json({ msg: "Correo electrónico actualizado exitosamente, puede logearse con su nuevo email" });
        }

        return res.status(400).json({ msg: "El token no coincide con ningún usuario" }); 
    }catch(error){
        console.error(error);
        return res.status(500).json({msg:"Error al comprobar el token"});
    }
}
export { Login, RecuperacionDeContrasenia, ComprobarTokenPassword, NuevaPassword, ConfirmacionCorreoNuevo};