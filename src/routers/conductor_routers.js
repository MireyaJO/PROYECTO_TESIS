import {Router} from 'express';
import { RegistroDeLosEstudiantes, LoginConductor, ActualizarPassword, RecuperacionPassword, ComprobarTokenPassword, NuevaPassword} from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
const router = Router();
//Rutas Públicas
router.post('/login/conductor', LoginConductor);
router.post('/recuperacion/contrasenia', RecuperacionPassword);
router.get('/comprobar/token/:token', ComprobarTokenPassword);
router.patch('/nueva/contrasenia/:token', NuevaPassword); 

//Rutas Privadas
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, RegistroDeLosEstudiantes);
router.patch('/actualizar/contrasenia', verificacionToken, verificacionConductorRol, ActualizarPassword);

export default router