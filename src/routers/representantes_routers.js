import {Router} from 'express';
import {verificacionAdminRol, verificacionRepresentanteRol, verificacionToken} from '../middlewares/autho.js'
import {RegistroDeRepresentantes, ConfirmacionCorreo, LoginRepresentante} from '../controllers/representantes_controller.js'
import {validacionesRepresentantes} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/registro/representante", validacionesRepresentantes, RegistroDeRepresentantes);
router.get("/confirmar/correoRepresentante/:token", ConfirmacionCorreo);
router.post("/login/representante", LoginRepresentante);

//Rutas privadas
router.get('/obtenerRepresentanteId', verificacionToken, verificacionRepresentanteRol, obtenerRepresentanteId)

//Rutas privadas
export default router