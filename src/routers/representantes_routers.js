import {Router} from 'express';
import {verificacionRepresentanteRol, verificacionToken} from '../middlewares/autho.js'
import {RegistroDeRepresentantes, ConfirmacionCorreo, LoginRepresentante, RecuperacionContraseniaRepresentante, ComprobarTokenPasswordRepresentante, NuevaPasswordRepresentante, 
    ActualizarPasswordRepresentante, EstudiantesRepresentados, VisuallizarPerfil, EliminarCuentaRepresentante, AlertaLlegadaConductor} from '../controllers/representantes_controller.js'
import {validacionesRepresentantes} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/registro/representantes", validacionesRepresentantes, RegistroDeRepresentantes);
router.get("/confirmar/correoRepresentante/:token", ConfirmacionCorreo);
router.post("/login/representante", LoginRepresentante);
router.post('/recuperacion/contrasenia/representante', RecuperacionContraseniaRepresentante);
router.get('/comprobar/token/representante/:token', ComprobarTokenPasswordRepresentante);
router.patch('/nueva/contrasenia/representante/:token', NuevaPasswordRepresentante);

//Rutas privadas
router.patch('/actualizar/contrasenia/representante', verificacionToken, verificacionRepresentanteRol, ActualizarPasswordRepresentante);  
router.get("/listar/representados", verificacionToken, verificacionRepresentanteRol, EstudiantesRepresentados);
router.get("/perfil/representante", verificacionToken, verificacionRepresentanteRol, VisuallizarPerfil);
router.delete("/eliminar/cuenta/representante", verificacionToken, verificacionRepresentanteRol, EliminarCuentaRepresentante);
router.get("/alerta/llegada/conductor", verificacionToken, verificacionRepresentanteRol, AlertaLlegadaConductor);

//Rutas privadas
export default router