import {Router} from 'express';
import { RegistroDeLosEstudiantes, LoginConductor } from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
const router = Router();
//Rutas Públicas
router.post('/login/conductor', LoginConductor);
//Rutas Privadas
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, RegistroDeLosEstudiantes);
export default router