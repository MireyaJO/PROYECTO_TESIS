import {Router} from 'express';
import {verificacionRepresentanteRol, verificacionToken} from '../middlewares/autho.js'
import {RegistroDeRepresentantes, ConfirmacionCorreo, ActualizarPasswordRepresentante, EstudiantesRepresentados, VisuallizarPerfil, EliminarCuentaRepresentante, AlertaLlegadaConductor, VerNotificaciones, ActualizarPerfilRepresentante} from '../controllers/representantes_controller.js'
import {validacionesRepresentantes, validacionesActualizarPerfilRepresentante} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/registro/representantes", validacionesRepresentantes, RegistroDeRepresentantes);
router.get("/confirmar/correoRepresentante/:token", ConfirmacionCorreo);

//Rutas privadas
router.patch('/actualizar/contrasenia/representante', verificacionToken, verificacionRepresentanteRol, ActualizarPasswordRepresentante);  
router.get("/listar/representados", verificacionToken, verificacionRepresentanteRol, EstudiantesRepresentados);
router.get("/perfil/representante", verificacionToken, verificacionRepresentanteRol, VisuallizarPerfil);
router.delete("/eliminar/cuenta/representante", verificacionToken, verificacionRepresentanteRol, EliminarCuentaRepresentante);
router.get("/alerta/llegada/conductor", verificacionToken, verificacionRepresentanteRol, AlertaLlegadaConductor);
router.get("/notificaciones/representante", verificacionToken, verificacionRepresentanteRol, VerNotificaciones);
router.patch("/actualizar/perfil/representante", verificacionToken, verificacionRepresentanteRol, validacionesActualizarPerfilRepresentante, ActualizarPerfilRepresentante);

export default router