/*import {Router} from 'express';
import {verificacionRepresentanteRol, verificacionToken} from '../middlewares/autho.js'
import {RegistroDeRepresentantes, ConfirmacionCorreo, ActualizarPasswordRepresentante, ConductorInfo, VisuallizarPerfil, EliminarCuentaRepresentante, ActualizarPerfilRepresentante} from '../controllers/representantes_controller.js'
import {validacionesRepresentantes, validacionesActualizarPerfilRepresentante, validarContraseniaNueva} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/registro/representantes", validacionesRepresentantes, RegistroDeRepresentantes);
router.get("/confirmar/correoRepresentante/:token", ConfirmacionCorreo);

//Rutas privadas
router.patch('/actualizar/contrasenia/representante', verificacionToken, verificacionRepresentanteRol, validarContraseniaNueva, ActualizarPasswordRepresentante);  
router.patch("/actualizar/perfil/representante", verificacionToken, verificacionRepresentanteRol, validacionesActualizarPerfilRepresentante, ActualizarPerfilRepresentante);
router.delete("/eliminar/cuenta/representante", verificacionToken, verificacionRepresentanteRol, EliminarCuentaRepresentante);
router.get("/info/conductor", verificacionToken, verificacionRepresentanteRol, ConductorInfo);
router.get("/perfil/representante", verificacionToken, verificacionRepresentanteRol, VisuallizarPerfil);

export default router*/