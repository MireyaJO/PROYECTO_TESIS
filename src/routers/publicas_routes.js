import {Router} from 'express';
import {Login, RecuperacionDeContrasenia, ComprobarTokenPassword, NuevaPassword, ConfirmacionCorreoNuevo} from '../controllers/para_todos_los_roles.js'
import {validacionesRecuperacion} from '../middlewares/validaciones.js'
const router = Router()
//Rutas publicas
router.post("/login", Login);
router.post('/recuperacion/contrasenia', RecuperacionDeContrasenia);
router.get('/comprobar/token/:token', ComprobarTokenPassword);
router.get("/cambio/email/:token", ConfirmacionCorreoNuevo);
router.patch('/nueva/contrasenia/:token', validacionesRecuperacion, NuevaPassword);

export default router