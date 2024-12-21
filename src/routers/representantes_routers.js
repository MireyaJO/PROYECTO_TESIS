import {Router} from 'express';
import {verificacionRepresentanteRol, verificacionToken} from '../middlewares/autho.js'
import {RegistroDeRepresentantes, ConfirmacionCorreo, LoginRepresentante, ObtenerRepresentanteId} from '../controllers/representantes_controller.js'
import {validacionesRepresentantes} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/registro/representante", validacionesRepresentantes, RegistroDeRepresentantes);
router.get("/confirmar/correoRepresentante/:token", ConfirmacionCorreo);
router.post("/login/representante", LoginRepresentante);

//Rutas privadas
router.get('/obtenerRepresentanteId', verificacionToken, verificacionRepresentanteRol, ObtenerRepresentanteId)

//Rutas privadas
export default router