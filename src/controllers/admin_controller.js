import cloudinary from 'cloudinary';
import fs from 'fs-extra';
import Conductores from '../models/Conductores.js';
import Estudiantes from '../models/Estudiantes.js'
import Representantes from '../models/Representantes.js';
import Historial from '../models/HistorialConductores.js';
import {enviarCorreoConductor, actualizacionDeConductor, eliminacionDelConductor,  informacionEliminacion, cambioAdmin, cambioConductor, asignacionAdministrador, nuevoAdministrador,
    designacionDeReemplazo, conductorDesactivado, conductorReactivado, conductorDesocupado} from "../config/nodemailer.js"; 
import crypto from 'crypto';


//Función para subir la imagen a Cloudinary y guardar la URL en la base de datos
const SubirImagen = async (file, nombre, apellido) =>{
    try {
        // Subir la imagen a Cloudinary con el nombre del conductor como public_id
        const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            public_id: `${nombre}_${apellido}`.replace(/\s+/g, '_'),
            folder: "conductores"
        });

        // Eliminar el archivo local después de subirlo
        await fs.unlink(file.tempFilePath);

        // Devolver la URL de la imagen
        return result.secure_url;
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg_registro_conductor: "Error al subir la imagen" });
    }
}

// Registros de los conductores
const  RegistroDeLosConductores = async (req, res) => {
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
        esReemplazo
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

        // ¿Qué sucede si el conductor no es un reemplazo y no se coloca la ruta y los sectores?
        if (esReemplazo == 'No'){
            if(!rutaAsignada){
                return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debes colocar la ruta asignada, ya que, no es un conductor reemplazo" });
            };
            if(!sectoresRuta){
                return res.status(400).json({ msg_registro_conductor: "Lo sentimos, debes colocar los sectores de la ruta asignada, ya que, no es un conductor reemplazo" });
            };
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
            esReemplazo, 
            estado: esReemplazo === 'Sí' ? 'Disponible' : 'Activo'
        });

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;
            try {
                // Guardar la URL de la imagen en la base de datos
                nuevoConductor.fotografiaDelConductor = await SubirImagen(file, nombre, apellido);
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

// Registros de un nuevo admin 
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
        trabajaraOno,
        asignacionOno,
        eliminacionAdminSaliente, 
        rutaAsignada, 
        sectoresRuta
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

        // Conductor logeado
        const conductorAdmin = await Conductores.findById(req.user.id);
        if (!conductorAdmin) return res.status(404).json({ msg_registro_conductor: "Lo sentimos, el conductor no se encuentra registrado" });

        // Si el usuario logeado tiene solo rol "admin" la "asignacionOno" es "No", porque no se tiene niños custodiados
        if (conductorAdmin.roles.includes("admin") && conductorAdmin.roles.length === 1 || conductorAdmin.numeroEstudiantes === 0){
            asignacionOno = 'No';
        }; 
        
        // Primera excepciones 
        if (conductorAdmin.roles.includes("conductor") && eliminacionAdminSaliente === 'Sí' && asignacionOno === 'Sí' && trabajaraOno === 'No'){
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, si el conductor admin aactual será eliminado y se desea la asignación de sus estudiantes, quedan a la deriva, ya que, el nuevo admin" });
        }; 

        // Segunda excepciónes
        if (conductorAdmin.roles.includes("conductor") && eliminacionAdminSaliente === 'Sí' && asignacionOno === 'No' && trabajaraOno === 'No'){
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, no puedes eliminar al conductor administrador saliente, ya que, el nuevo administrador no trabajará como conductor y los estudiantes quedarán a la deriva" });

        };
        
        // Tercera excepciones
        if (conductorAdmin.roles.includes("conductor") && eliminacionAdminSaliente === 'Sí' && asignacionOno === 'No' && trabajaraOno === 'Sí'){
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, no puedes eliminar al conductor administrador saliente, ya que, el nuevo administrador no trabajará como conductor y los estudiantes quedarán a la deriva" });
        }; 

        // Cuarta excepciones
        if (conductorAdmin.roles.includes("conductor") && eliminacionAdminSaliente === 'No' && asignacionOno === 'Sí' && trabajaraOno === 'No'){
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, no puedes eliminar al conductor administrador saliente, ya que, el nuevo administrador no trabajará como conductor y los estudiantes quedarán a la deriva" });
        };

        // Crear un nuevo conductor con los datos proporcionados
        const nuevoConductor = new Conductores({
            nombre,
            apellido,
            telefono, 
            generoConductor,
            institucion: conductorAdmin.institucion,
            esReemplazo: 'No',
            estado: trabajaraOno === 'Sí' ? 'Trabaja como conductor' : 'No trabaja como conductor',
            placaAutomovil,
            cedula,
            email,
            roles: trabajaraOno === 'Sí' ? ["conductor", "admin"] : ["admin"],
        });

        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {    
            const file = req.files.fotografiaDelConductor;
            try {
                // Guardar la URL de la imagen en la base de datos
                nuevoConductor.fotografiaDelConductor = await SubirImagen(file, nombre, apellido);
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

        if (asignacionOno === 'Sí'){
            //Asignación de campos ruta y sectores del conductor admin saliente 
            nuevoConductor.rutaAsignada = conductorAdmin.rutaAsignada;
            nuevoConductor.sectoresRuta = conductorAdmin.sectoresRuta;

            // Actualizar los estudiantes que tienen la misma ruta asignada
            const estudiantes = await Estudiantes.find({ruta:nuevoConductor.rutaAsignada});
            const cantidadEstudiantes = estudiantes.length; 
            if(cantidadEstudiantes > 0){
                for (const estudiante of estudiantes) {
                    await Estudiantes.findByIdAndUpdate(estudiante._id, { conductor: nuevoConductor._id });
                    const estudianteRegistrado = {idEstudiante: estudiante._id, nombreEstudiante: estudiante.nombre, apellidoEstudiante: estudiante.apellido, nivelEscolarEstudiante: estudiante.nivelEscolar, paraleloEstudiante: estudiante.paralelo, cedulaEstudiante: estudiante.cedula} 
                    nuevoConductor.estudiantesRegistrados.push(estudianteRegistrado); 
                    for (const representanteId of estudiante.representantes){
                        const representante = await Representantes.findById(representanteId); 
                        if(representante){
                            await cambioConductor(representante.email, representante.nombre, representante.apellido, nuevoConductor.rutaAsignada, nuevoConductor.nombre, nuevoConductor.apellido, nuevoConductor.apellido, nuevoConductor.nombre, "Permanente");
                        }
                    }
                }  
                nuevoConductor.numeroEstudiantes = cantidadEstudiantes;
            }

            //Actualización de los campos del conductor admin saliente
            conductorAdmin.rutaAsignada = null;
            conductorAdmin.sectoresRuta = null;
            conductorAdmin.numeroEstudiantes = 0;
            conductorAdmin.estudiantesRegistrados = [];
        } else if (asignacionOno === 'No'){
            //Validación para que no se duplique la ruta de los conductores
            const buscarConductorRuta = await Conductores.findOne({rutaAsignada: rutaAsignada, estado: true});
            if (buscarConductorRuta) return res.status(400).json({msg_registro_conductor:"Lo sentimos, la ruta ya se encuentra asignada a otro conductor"});
            //Asignación de nuevos campos ruta y sectores del nuevo conductor admin 
            nuevoConductor.rutaAsignada = rutaAsignada;
            nuevoConductor.sectoresRuta = sectoresRuta;
        }; 

        //Información del admin saliente para el envío del correo al conductor nuevo 
        const datosConductorAdmin = {
            nombre: conductorAdmin.nombre, 
            apellido: conductorAdmin.apellido
        }; 

        if(eliminacionAdminSaliente === 'Sí'){
            //Eliminar la imagen en Cloudinary 
            const publicId = `conductores/${conductorAdmin.nombre}_${conductorAdmin.apellido}`;
            try{
                await cloudinary.v2.uploader.destroy(publicId);
            }catch{
                console.error("Error al eliminar la imagen en Cloudinary");
                return res.status(500).json({msg_eliminacion_conductor:"Error al eliminar la imagen"}); 
            }

            //Eliminación defenitiva del conductor saliente 
            await Conductores.findOneAndDelete({_id: conductorAdmin._id});
        } else if (eliminacionAdminSaliente === 'No' && conductorAdmin.roles.length === 2){
            //Quitar los privilegios de administrador al conductor que realizó la acción
            const index = conductorAdmin.roles.indexOf("admin");
            //Eliminar el rol de administrador
            if (index > -1) {
                conductorAdmin.roles.splice(index, 1);
            };

            //Si el conductor queda con el campo "roles" con una longitud de 0 se añadirá unicamente el rol "conductor"
            if (conductorAdmin.roles.length === 0){
                conductorAdmin.roles.push("conductor"); 
            };
        } else if (eliminacionAdminSaliente === 'No' && conductorAdmin.roles.includes("admin") && conductorAdmin.roles.length === 1){
            //Quitar los privilegios de administrador al conductor que realizó la acción
            const index = conductorAdmin.roles.indexOf("admin");
            //Eliminar el rol de administrador
            if (index > -1) {
                conductorAdmin.roles.splice(index, 1);
            };

            //Añadir el rol de conductor al admin saliente
            conductorAdmin.roles.push("conductor");
        };

        // Guardar el nuevo conductor en la base de datos
        await nuevoConductor.save();

        //Guardar los cambios en la base de datos del conductor admin saliente solo cuando sea necesario 
        if ((asignacionOno === 'Sí' || asignacionOno === 'No') && eliminacionAdminSaliente === 'No'){
            await conductorAdmin.save();
        }

        //Información a los conductores que se ha registrado un nuevo administrador
        const conductores = await Conductores.find({roles: 'conductor'});
        for(const conductor of conductores){
            await cambioAdmin(nuevoConductor.nombre, nuevoConductor.apellido, conductor.email, conductor.nombre, conductor.apellido, 
                nuevoConductor.apellido, nuevoConductor.nombre); 
        };

        //Aviso al nuevo coordinador de rutas
        await nuevoAdministrador(nuevoConductor.email, nuevoConductor.nombre, nuevoConductor.apellido, 
            randomPassword, nuevoConductor.rutaAsignada, nuevoConductor.sectoresRuta, datosConductorAdmin.apellido, datosConductorAdmin.nombre);
        res.status(200).json({ 
            msg_registro_conductor: "Conductor registrado exitosamente", 
            nuevoAdmin: nuevoConductor
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al registrar el conductor administrador",
            error: error.message
        });
    }
};

// Visualizar el perfil del conductor logeado, que tiene privilegios de admin
const VisualizarPerfil = async (req, res)=>{
    try{
        // Información del conductor logeado
        const conductor = await Conductores.findById(req.user.id).select("-password -createdAt -updatedAt -__v");
        // Verificación de la existencia del conductor
        if (!conductor) return res.status(404).json({ msg_visualizar_conductor: "Conductor no encontrado" });

        //Objeto con la información necesaria para el administrador
        const infoAdmin = {
            nombre: conductor.nombre,
            apellido: conductor.apellido,
            cooperativa: conductor.cooperativa,
            telefono: conductor.telefono,
            placaAutomovil: conductor.placaAutomovil,
            generoConductor: conductor.generoConductor,
            cedula: conductor.cedula,
            institucion: conductor.institucion,
            fotografiaDelConductor: conductor.fotografiaDelConductor,
            email: conductor.email,
            estado: conductor.estado
        }
        //Si se encuentra el conductor se envía su información
        res.status(200).json({
            msg_admin: "Perfil del administrador encontrado exitosamente",
            administrador: infoAdmin,
            asignacionOno: conductor.roles.includes("conductor") ? "Sí" : "No"
        });
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg: "Error al visualizar el perfil del administrador",
            error: error.message
        });
    }
}; 

//Actualizacion de las rutas y sectores de los conductores por su id
const ActualizarRutasYSectoresId = async (req, res) => {
    //Obtener el id de los parámetros de la URL
    const {id} = req.params;

    //Obtener la ruta y los sectores de la solicitud
    const {rutaAsignada, sectoresRuta} = req.body;

    //Id del conductor logeado
    const {id_coordinador} = req.user;

    try{
        // Verificación de la existencia del conductor al que se va actualizar
        const conductor = await Conductores.findOne({
            _id: id, 
            esReemplazo: 'No', 
            estado: { $in: ["Activo", "Trabaja como conductor"] }
        });
        if (!conductor) return res.status(400).json({ msg_actualizacion_conductor: "Lo sentimos, el conductor ha actualizar no se ha encontrado" });

        // Verificar si el conductor tiene un reemplazo activo, esta validación se la deja por si ocurre algún error, pero realmente no es necesaria
        const reemplazoActivo = await Conductores.findOne({
            rutaAsignada: conductor.rutaAsignada,
            estado: 'Ocupado',
            esReemplazo: 'Sí',
        });

        if (reemplazoActivo) {
            return res.status(400).json({
                msg_actualizacion_conductor: "No se puede actualizar la información del conductor original mientras esté siendo reemplazado.",
            });
        }

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

        //Solo se envía el correo al conductor que tiene privilegios de conductor
        if ( conductor.roles.includes["conductor"] && conductor.roles.length === 1){
            //Envio del correo al conductor 
            await actualizacionDeConductor(conductor.email, conductor.apellido, conductor.nombre, rutaAsignada, sectoresRuta, id_coordinador.apellido, id_coordinador.nombre);

        }; 

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
}; 

//Actualización del conductor admin logeado
const ActualizarInformacionAdmin = async (req, res) => {
    //Extraer los campos del cuerpo de la solicitud
    const {
        telefono, 
        cedula, 
        cooperativa,
        placaAutomovil, 
        email, 
    } = req.body;
    //Obtención del id del conductor logeado
    const {id} = req.user;
    // Verificación de los campos vacíos
    if (Object.values(req.body).includes("")) return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes llenar todos los campos" });
    try{
        // Verificación de la existencia del conductor
        const conductor = await Conductores.findById(id);
        if (!conductor) return res.status(404).json({ msg_actualizacion_perfil: "Lo sentimos, el conductor logeado no se encuentra registrado" });
        
        // Comprobar si el email ya está registrado
        const verificarEmailBDD = await Conductores.findOne({ email, _id: { $ne: id } });
        const verificarRepresentateBDD = await Representantes.findOne({ email });
        if (verificarEmailBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como conductor" });
        };
        if (verificarRepresentateBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el email ya se encuentra registrado como representante" });
        };

        // Comprobar si la cédula ya está registrada
        const verificarCedulaBDD = await Conductores.findOne({ cedula, _id: { $ne: id } });
        const verificarCedulaRepresentanteBDD = await Representantes.findOne({ cedula });
        if (verificarCedulaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los conductores" });
        };
        if (verificarCedulaRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la cédula ya se encuentra registrada en los representantes" });
        };

        // Comprobar si el teléfono ya está registrado
        const verificarTelefonoBDD = await Conductores.findOne({ telefono, _id: { $ne: id } });
        const verificarTelefonoRepresentanteBDD = await Representantes.findOne({ telefono });
        if (verificarTelefonoBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el teléfono ya se encuentra registrado en los conductores" });
        };
        if (verificarTelefonoRepresentanteBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, el teléfono ya se encuentra registrado en los representantes" });
        };

        // Comprobar si la placa ya está registrada
        const verificarPlacaBDD = await Conductores.findOne({ placaAutomovil, _id: { $ne: id } });
        if (verificarPlacaBDD) {
            return res.status(400).json({ msg_registro_conductor: "Lo sentimos, la placa ya se encuentra registrada" });
        };
        // Verificar si se envió un archivo de imagen
        if (req.files && req.files.fotografiaDelConductor) {
            const file = req.files.fotografiaDelConductor;
            try {
                // Definir el public_id para Cloudinary
                const publicId = `conductores/${conductor.nombre}_${conductor.apellido}_admin`;

                // Eliminar la imagen anterior en Cloudinary
                await cloudinary.v2.uploader.destroy(publicId);

                // Guardar la URL de la imagen en la base de datos
                conductor.fotografiaDelConductor = await SubirImagen(file, nombre, apellido);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ msg_actualizacion_perfil: "Error al subir la imagen" });
            }
        } else {
            return res.status(400).json({ msg_actualizacion_perfil: "Lo sentimos, debes subir una imagen" });
        };

        // Si el email cambia, enviar un enlace de confirmación al nuevo correo
        if (email !== conductor.email) {
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
        conductor.cedula = cedula;
        conductor.cooperativa = cooperativa;
        conductor.placaAutomovil = placaAutomovil;

        // Guardar los cambios en la base de datos
        await conductor.save();
        res.status(200).json({ msg_actualizacion_perfil: "Los datos del conductor han sido actualizados exitosamente" });
    } catch(error){
        console.error(error);
        res.status(500).json({msg_actualizacion_perfil:"Error al actualizar el perfil del conductor"});
    }
};

// Asignación de privilegios de administrador a un conductor que ya se encuentra trabajando en la institución
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
        
        //Guardar los cambios en la base de datos
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
};

// Cambiar la contraseña ya establecida, el conductor ya se encuentra logeado
const ActualizarPassword = async (req, res) => {
    // Toma de los datos del conductor que desea cambiar su contraseña
    const {passwordAnterior, passwordActual, passwordActualConfirm} = req.body;

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
};

// Reemplazo temporal de un conductor por otro conductor
const ReemplazoTemporal = async (req, res) => {
    // Obtener los ids del conductor antiguo y nuevo de los parámetros de la URL
    const {idAntiguo, idReemplazo} = req.params;

    //Id del coordinador de rutas
    const {idCoordinador} = req.user;

    try{
        //Verificar si los conductores existen 
        const conductorAntiguo = await Conductores.findById({_id: idAntiguo, estado: { $in: ["Activo", "Trabaja como conductor"] }});
        const conductorReemplazo = await Conductores.findById({_id: idReemplazo, estado: 'Disponible'});
        //El conductor antiguo no existe 
        if(!conductorAntiguo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorAntiguo.nombre} ${conductorAntiguo.apellido} no se encuentra registrado`});

        //El conductor de reemplazo no existe
        if(!conductorReemplazo) return res.status(400).json({msg_reemplazo:`El conductor ${conductorReemplazo.nombre} ${conductorReemplazo.apellido} no se encuentra registrado como reemplazo`});

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
            await estudianteId.save();

            //Objeto con la información de cada estudiante que se encuentra vinculado al conductor antiguo
            const estudianteRegistrado = {idEstudiante: estudianteId._id, nombreEstudiante: estudianteId.nombre, apellidoEstudiante: estudianteId.apellido, nivelEscolarEstudiante: estudianteId.nivelEscolar, 
                paraleloEstudiante: estudianteId.paralelo, cedulaEstudiante: estudianteId.cedula};
            //Actualizar el campo "estudiantesRegistrados" del conductor de reemplazo
            conductorReemplazo.estudiantesRegistrados.push(estudianteRegistrado); 

            //Obtener los representantes de los estudiantes
            for(const representanteId of estudianteId.representantes){
                const representante = await Representantes.findById(representanteId); 
                if(representante){
                    await cambioConductor(representante.email, representante.nombre, representante.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.nombre, conductorReemplazo.apellido, conductorAntiguo.nombre, conductorAntiguo.apellido, conductorReemplazo.telefono, idCoordinador.apellido, idCoordinador.nombre, "Temporal");            
                };
            };
        };

        //Actualizar información del conductor reemplazo
        const cantidadEstudiantes = estudiantesConductorAntiguo.length;
        //Actualizar el número de estudiantes del conductor de reemplazo
        conductorReemplazo.numeroEstudiantes = cantidadEstudiantes;
        //Actualizar la ruta y sectores del conductor de reemplazo
        conductorReemplazo.rutaAsignada = conductorAntiguo.rutaAsignada;
        conductorReemplazo.sectoresRuta = conductorAntiguo.sectoresRuta;
        //Actualizar el estado del conductor de reemplazo
        conductorReemplazo.estado = 'Ocupado';

        //Desactivar al conductor antiguo 
        if (conductorAntiguo.roles.includes("admin") && conductorAntiguo.roles.length === 2){            
            //Cambiar el campo "estado" del conductor con privilegios de admin y conductor 
            conductorAntiguo.estado = 'No trabaja como conductor';
        } else if (conductorAntiguo.roles.includes("conductor") && conductorAntiguo.roles.length === 1){
            //Cambiar el campo "estado" del conductor con privilegios de conductor
            conductorAntiguo.estado = 'Inactivo';
        };

        //Guardar los cambios en la base de datos de conductores
        await conductorReemplazo.save();
        await conductorAntiguo.save();

        if (conductorAntiguo.roles.includes("conductor") && conductorAntiguo.roles.length === 1){
            //Envio del correo al conductor inactivo solo si es un conductor normal  
            await conductorDesactivado (conductorAntiguo.email, conductorAntiguo.nombre, conductorAntiguo.apellido, conductorReemplazo.nombre, conductorReemplazo.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.sectoresRuta, idCoordinador.nombre, idCoordinador.apellido); 
        };

        //Enviar correo al conductor de reemplazo
        await designacionDeReemplazo(conductorReemplazo.email, conductorReemplazo.nombre, conductorReemplazo.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.sectoresRuta, conductorAntiguo.nombre, conductorAntiguo.apellido, 'Temporal', idCoordinador.nombre, idCoordinador.apellido);

        //Guardar la acción que se realiza en el historial para el reporte del fronted 
        const historial = new Historial({
            conductor: conductorAntiguo._id,
            nombreConductor: conductorAntiguo.nombre,
            apellidoConductor: conductorAntiguo.apellido,
            accion: "Reemplazo",
            rutaAsignada: conductorAntiguo.rutaAsignada,
            tipoReemplazo: "Temporal",
            conductorReemplazo: conductorReemplazo._id,
            nombreConductorReemplazo: conductorReemplazo.nombre,
            apellidoConductorReemplazo: conductorReemplazo.apellido,
            numeroDeEstudiantesAsignados: cantidadEstudiantes
        }); 

        //Guardar el historial en la base de datos
        await historial.save();

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

    //Id del usuario logeado 
    const {idCoordinador} = req.user;

    try{
        // Verificación de la existencia de los conductores 
        const conductorAntiguo = await Conductores.findById({_id: idAntiguo, estado: { $in: ["Activo", "Trabaja como conductor"] }});
        const conductorReemplazo = await Conductores.findById({_id: idReemplazo, estado: 'Disponible'});

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
            await estudianteId.save();

            //Objeto que contiene la información de cada estudiante que se encuentra vinculado al conductor antiguo
            const estudianteRegistrado = {idEstudiante: estudianteId._id, nombreEstudiante: estudianteId.nombre, apellidoEstudiante: estudianteId.apellido, nivelEscolarEstudiante: estudianteId.nivelEscolar, 
                paraleloEstudiante: estudianteId.paralelo, cedulaEstudiante: estudianteId.cedula}
            //Actualizar el campo "estudiantesRegistrados" del conductor de reemplazo
            idReemplazo.estudiantesRegistrados.push(estudianteRegistrado);

            //Obtener los representantes de los estudiantes 
            for(const representanteId of estudianteId.representantes){
                const representante = await Representantes.findById(representanteId);
                if(representante){
                    await cambioConductor(representante.email, representante.nombre, representante.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.nombre, conductorReemplazo.apellido, idCoordinador.apellido, idCoordinador.nombre, "Permanente");
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
        //Se convierte en un conductor original 
        conductorReemplazo.esReemplazo = 'No';
        conductorReemplazo.estado = 'Activo';
        
        //Desactivar al conductor si solo si es un conductor que tiene privilegios de admin y conductor
        if (conductorAntiguo.roles.includes("admin") && conductorAntiguo.roles.length === 2){     
            //Quitar los privilegios de administrador
            const index = conductorAntiguo.roles.indexOf("admin");
            
            //Eliminar el rol de administrador
            if (index > -1) {
                conductorAntiguo.roles.splice(index, 1);
            }

            //Cambiar el campo "estado" del conductor con privilegios de admin y conductor 
            conductorAntiguo.estado = 'No trabaja como conductor';

            //Guardar los cambios en la base de datos de conductores
            await conductorAntiguo.save();
        } else if (conductorAntiguo.roles.includes("conductor") && conductorAntiguo.roles.length === 1){
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
        };

        //Guardar los cambios en la base de datos de conductores
        await conductorReemplazo.save();

        //Envio del correo al conductor eliminado 
        await eliminacionDelConductor(conductorAntiguo.email, conductorAntiguo.nombre, conductorAntiguo.apellido, idCoordinador.apellido, idCoordinador.nombre);

        //Envio del correo al conductor de reemplazo
        await designacionDeReemplazo(conductorReemplazo.email, conductorReemplazo.nombre, conductorReemplazo.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.sectoresRuta, conductorAntiguo.nombre, conductorAntiguo.apellido, 'Permanente', idCoordinador.nombre, idCoordinador.apellido);

        //Guardar la acción que se realiza en el historial para el reporte del fronted
        const historial = new Historial({
            conductor: conductorAntiguo._id,
            nombreConductor: conductorAntiguo.nombre,
            apellidoConductor: conductorAntiguo.apellido,
            accion: "Reemplazo",
            rutaHaCubrir: conductorReemplazo.rutaAsignada,
            tipoReemplazo: "Permanente",
            conductorReemplazo: conductorReemplazo._id,
            nombreConductorReemplazo: conductorReemplazo.nombre,
            apellidoConductorReemplazo: conductorReemplazo.apellido,
            numeroDeEstudiantesAsignados: cantidadEstudiantes
        });

        //Guardar el historial en la base de datos
        await historial.save();

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

const ActivarConductorOriginal = async (req, res) => {
    //Obtener el id del conductor original de los parámetros de la URL
    const {idConductor} = req.params;

    //Obtener el id del coordinador de rutas logeado
    const {idCoordinador} = req.user;
    try{
        //Verificación de la existencia del conductor original
        const conductorOriginal = await Conductores.findById({_id: idConductor, estado: { $in: ["Activo", "Trabaja como conductor"] }, esReemplazo: 'No'});
        if(!conductorOriginal) return res.status(400).json({msg_activacion_conductor:"El conductor original no se encuentra registrado"});
        
        //¿El conductor tiene o no un reemplazo?
        const reemplazoActivo = await Conductores.findOne({rutaAsignada: conductorOriginal.rutaAsignada, estado: 'Ocupado', esReemplazo: 'Sí'});
        if(!reemplazoActivo) return res.status(400).json({msg_activacion_conductor:"El conductor original no tiene un reemplazo activo"});

        //Realizar la reasignación de los estudiantes
        const estudiantesAsignados = Estudiantes.find({conductor: reemplazoActivo._id});
        for(const estudianteId of estudiantesAsignados){
            //Actualizar el conductor de los estudiantes
            await Estudiantes.findByIdAndUpdate(estudianteId._id, {conductor: conductorOriginal._id});

            //Guardar los cambios en la base de datos de estudiantes
            await estudianteId.save();

            //Objeto con la información de los estudiantes para devolverlos al conductor original
            const estudianteRegistrado = {idEstudiante: estudianteId._id, nombreEstudiante: estudianteId.nombre, apellidoEstudiante: estudianteId.apellido, nivelEscolarEstudiante: estudianteId.nivelEscolar,
                paraleloEstudiante: estudianteId.paralelo, cedulaEstudiante: estudianteId.cedula}; 
            
            //Actualizar el campo "estudiantesRegistrados" del conductor original
            conductorOriginal.estudiantesRegistrados.push(estudianteRegistrado);

            //Obtener los representantes de los estudiantes e informar que el conductor original ha sido reactivado
            for(const representanteId of estudianteId.representantes){
                const representante = await Representantes.findById(representanteId);
                if(representante){
                    await cambioConductor(representante.email, representante.nombre, representante.apellido, conductorReemplazo.rutaAsignada, conductorReemplazo.nombre, conductorReemplazo.apellido, idCoordinador.apellido, idCoordinador.nombre, "Permanente");
                }
            }
        }; 

        //Actualizar la información del conductor original
        const cantidadEstudiantes = estudiantesAsignados.length;
        //Actualizar el número de estudiantes del conductor original
        conductorOriginal.numeroEstudiantes = cantidadEstudiantes;
        //Actualizar la ruta y sectores del conductor original
        conductorOriginal.rutaAsignada = reemplazoActivo.rutaAsignada;
        conductorOriginal.sectoresRuta = reemplazoActivo.sectoresRuta;
        //Se actualiza la disponibilidad del conductor original
        reemplazoActivo.estado = 'Trabaja como conductor';
        //Guardar los cambios en la base de datos de conductores
        await conductorOriginal.save();
        await reemplazoActivo.save();

        //Envio del correo al conductor original
        if(conductorOriginal.roles.includes("conductor") && conductorOriginal.roles.length === 1){
            await conductorReactivado(conductorOriginal.email, conductorOriginal.nombre, conductorOriginal.apellido, conductorOriginal.rutaAsignada, conductorOriginal.sectoresRuta, idCoordinador.nombre, idCoordinador.apellido);
        }

        //Envio del correo al conductor de reemplazo
        await conductorDesocupado(reemplazoActivo.email, reemplazoActivo.nombre, reemplazoActivo.apellido, conductorOriginal.rutaAsignada, conductorOriginal.sectoresRuta, idCoordinador.nombre, idCoordinador.apellido);
        
        //Guardar la acción que se realiza en el historial para el reporte del fronted
        const historial = new Historial({
            conductor: conductorOriginal._id,
            nombreConductor: conductorOriginal.nombre,
            apellidoConductor: conductorOriginal.apellido,
            accion: "Activación",
            conductorReemplazo: reemplazoActivo._id,
            nombreConductorReemplazo: reemplazoActivo.nombre,
            apellidoConductorReemplazo: reemplazoActivo.apellido,
            numeroDeEstudiantesAsignados: cantidadEstudiantes
        });

        //Guardar el historial en la base de datos
        await historial.save();
        
        res.status(200).json({
            msg_reemplazo: `$El conductor ${conductorOriginal.nombre} ${conductorOriginal.apellido} se ha activado.`,
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            msg_activacion_conductor:"Error al activar al conductor original",
            error: error.message
        });
    };
}; 

// Listar todos los conductores de la Unidad Educativa Particular EMAÚS
const ListarConductor = async (req, res) => {
    try{
        //Obtención de los conductores normales
        const conductores = await Conductores.find({
            esReemplazo: 'No',
            estado: { $in: ["Activo", "Trabaja como conductor"] }
        }).select("-password -updatedAt -createdAt -__v");

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
}; 

// Buscar un conductor en especifico por la ruta asignada
const BuscarConductorRuta = async (req, res) => {
    try {
        // Obtener el número de la ruta de los parámetros de la URL
        const {rutaAsignada} = req.params;

        // Busqueda de un conductor que tenga la misma ruta que se encuentra en los parámetros de la URL 
        const conductor = await Conductores.findOne({
            rutaAsignada: rutaAsignada,
            esReemplazo: 'No', 
            estado: { $in: ["Activo", "Trabaja como conductor"] }
        }).select("-password -updatedAt -createdAt -__v");
        
        if (!conductor) {
            return res.status(400).json({ msg: "Lo sentimos, no se ha encontrado ningún conductor con esa ruta que se encuentra activo o el admin no tiene privilegios de conductor" });
        }

        // Mensaje de éxito
        res.status(200).json({ msg_buscar_conductor_ruta: `El conductor de la ruta ${rutaAsignada} se han encontrado exitosamente`, conductor: conductor });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            msg_buscar_conductor_ruta: "Error al buscar conductores por ruta", 
            error: error.message 
        });
    };
}; 

//Listar conductores disponibles 
const ListarReemplazoDisponibles = async (req, res) => {
    try{
        //Consultar los conductores con el campo "esReemplazo" igual a true
        const conductores = await Conductores.find({roles: { $in: ["conductor"], $nin: ["admin"] }, esReemplazo: 'Sí', estado: 'Disponible'}).select("-password -updatedAt -createdAt -__v");

        //Validación de que existan conductores de reemplazo
        if(conductores.length === 0) return res.status(400).json({msg_listar_conductores_reemplazo:"No se han encontrado conductores de reemplazo"});
        
        //Mensaje de exito
        res.status(200).json({msg_listar_conductores_reemplazo:"Los conductores de reemplazo se han encontrado exitosamente", reemplazosDisponibles: conductores});
    }catch(error){
        console.log(error); 
        res.status(500).json({
            msg_listar_conductores_reemplazo: "Error al listar los conductores de reemplazo",
            error: error.message
        });
    };
}; 

//Listar conductores que no son reemplazo que poseen un reemplazo activo
const ListarConductoresConReemplazo = async (req, res) => {
    try {
        // Consultar los conductores que no son reemplazos y tienen un reemplazo activo
        const conductores = await Conductores.find({
            esReemplazo: 'No',
            $or: [
                { estado: 'Inactivo', roles: ['conductor'] },
                { estado: 'No trabaja como conductor', roles: ['conductor', 'admin'] }
            ]
        }).select("-password -updatedAt -createdAt -__v");
    
        // Validar si no se encontraron conductores
        if (conductores.length === 0) {
            return res.status(404).json({ msg: "No se encontraron conductores con reemplazos activos" });
        }
    
        // Respuesta exitosa
        res.status(200).json({ msg: "Conductores con reemplazos activos encontrados", conductoresConReemplazo: conductores });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al listar conductores con reemplazos activos", error: error.message });
    };
};

// Buscar un conductor en especifico por el nombre y apellido
const BuscarConductoresConReemplazo = async (req, res) => {
    try{
        //Obtener el nombre y apellido del conductor de los parámetros de la URL 
        const {rutaAsignada} = req.params;
        //Buscar el conductor por nombre y apellido
        const conductor = await Conductores.findOne({
            rutaAsignada: rutaAsignada,
            esReemplazo: 'No',
            $or: [
                { estado: 'Inactivo', roles: ['conductor'] },
                { estado: 'No trabaja como conductor', roles: ['conductor', 'admin'] }
            ]
        }).select("-password -updatedAt -createdAt -__v");

        //Validación de que el conductor existe
        if(!conductor) return res.status(400).json({msg_buscar_conductor_reemplazo:"El conductor no se encuentra registrado o no tiene un reemplazo activo"});

        //Mensaje de exito
        res.status(200).json({msg_buscar_conductor_reemplazo:"El conductor se ha encontrado exitosamente", conductorConReemplazo: conductor});
    } catch(error){
        console.log(error);
        res.status(500).json({msg_buscar_conductor_reemplazo:"Error al buscar conductores de reemplazo por nombre o apellido", error: error.message});
    };
};

//Controladores para los reportes del fronted
const CantidadReemplazosYActivacion = async (req, res) => {
    try{
        //Consultar los reemplazos que se encuentran activos 
        const reemplazoActivo = await Estudiantes.find({estado: 'Ocupado', esReemplazo: 'Sí'});

        //Cantidad de reemplazos activos
        const cantidadReemplazosActivos = reemplazoActivo.length;

        //Consultar reemplazos terminados 
        const reemplazoTerminado = await Historial.find({accion: 'Activación'});  
        
        //Cantidad de reemplazos terminados
        const cantidadReemplazosTerminados = reemplazoTerminado.length;

        //Consultar reemplazos temporales
        const reemplazosTemporales = await Historial.find({tipoReemplazo: 'Temporal'});

        //Cantidad de reemplazos temporales
        const cantidadReemplazosTemporales = reemplazosTemporales.length;

        //Consultar reemplazos permanentes
        const reemplazosPermanentes = await Historial.find({tipoReemplazo: 'Permanente'});

        //Cantidad de reemplazos permanentes
        const cantidadReemplazosPermanentes = reemplazosPermanentes.length;

        //Mensaje de exito 
        res.status(200).json({
            msg_historial_reemplazo:"El historial de reemplazos y activación de conductores se ha encontrado exitosamente", 
            reemplazoActivo: cantidadReemplazosActivos, 
            reemplazoTerminado: cantidadReemplazosTerminados, 
            reemplazosTemporales: cantidadReemplazosTemporales, 
            reemplazosPermanentes: cantidadReemplazosPermanentes
        });


    } catch(error){
        console.log(error);
        res.status(500).json({msg_historial_reemplazo:"Error al listar el historial de conductores reemplazados y sus activaciones", error: error.message});
    };
};

//Información completa de reemplazos 
const InformacionParaReporte = async (req, res) => {
    try{
        //Parametros obtenidos desde la petición
        const {informacionHaVisualizar} = req.body;

        if(informacionHaVisualizar === 'Reemplazo temporal'){
            //Consultar reemplazos temporales en la base dedatos 
            const reemplazosTemporales = await Historial.find({tipoReemplazo: 'Temporal'}).select("-conductor -conductorReemplazo -updatedAt -createdAt -__v");
            
            //Validación de que existan reemplazos temporales
            if(reemplazosTemporales.length === 0) return res.status(400).json({msg_historial_reemplazo:"No se han encontrado reemplazos temporales"});
            
            //Respuesta exitosa con la información de los reemplazos temporales
            res.status(200).json({msg_historial_reemplazo:"El historial de reemplazos temporales", infoReemplazosTemporales: reemplazosTemporales});
        } else if(informacionHaVisualizar === 'Reemplazo permanente'){
            //Consultar reemplazos permanentes en la base dedatos 
            const reemplazosPermanentes = await Historial.find({tipoReemplazo: 'Permanente'}).select("-conductor -conductorReemplazo -updatedAt -createdAt -__v");

            //Validación de que existan reemplazos permanentes
            if(reemplazosPermanentes.length === 0) return res.status(400).json({msg_historial_reemplazo:"No se han encontrado reemplazos permanentes"});

            //Respuesta exitosa con la información de los reemplazos permanentes
            res.status(200).json({msg_historial_reemplazo:"El historial de reemplazos permanentes", infoReemplazosPermanentes: reemplazosPermanentes});
        } else if (informacionHaVisualizar === 'Activación de conductores originales'){
            //Consultar activaciones en la base dedatos 
            const activaciones = await Historial.find({accion: 'Activación'}).select("-conductor -conductorReemplazo -updatedAt -createdAt -__v");

            //Validación de que existan activaciones, termino del reemplazo temporal
            if(activaciones.length === 0) return res.status(400).json({msg_historial_reemplazo:"No se han encontrado activaciones de conductores"});

            //Respuesta exitosa con la información de las activaciones
            res.status(200).json({msg_historial_reemplazo:"El historial de activaciones", infoActivacion: activaciones});
        } else if (informacionHaVisualizar === 'Reemplazo Activos'){
            //Consultar reemplazos activos en la base dedatos 
            const reemplazoActivo = await Estudiantes.find({estado: 'Ocupado', esReemplazo: 'Sí'}).select("nombre apellido rutaAsignada estado");

            //Validación de que existan reemplazos permanentes
            if(reemplazoActivo.length === 0) return res.status(400).json({msg_historial_reemplazo:"No se han encontrado reemplazos activos"});

            //Respuesta exitosa con la información de los reemplazos activos
            res.status(200).json({msg_historial_reemplazo:"El historial de reemplazos activos", infoReemplazosActivos: reemplazoActivo});

        } else{
            return res.status(400).json({msg_historial_reemplazo:"Lo sentimos,solo se puede visualizar el historial de reemplazos temporales, permanentes, activaciones de conductores originales y los reemplazos que siguen activos"});
        }

    }catch(error){
        console.log(error);
        res.status(500).json({msg_historial_reemplazo:"Error al listar el historial de conductores reemplazados y sus activaciones", error: error.message});
    };
};

export {
    RegistroDeLosConductores,
    ActualizarRutasYSectoresId,
    VisualizarPerfil, 
    ActualizarInformacionAdmin, 
    AsignarPrivilegiosDeAdmin, 
    RegistrarNuevoAdmin, 
    ActualizarPassword, 
    ReemplazoTemporal, 
    ReemplazoPermanente, 
    ActivarConductorOriginal, 
    ListarReemplazoDisponibles, 
    BuscarConductorRuta,
    ListarConductor,
    ListarConductoresConReemplazo, 
    BuscarConductoresConReemplazo, 
    CantidadReemplazosYActivacion, 
    InformacionParaReporte
};