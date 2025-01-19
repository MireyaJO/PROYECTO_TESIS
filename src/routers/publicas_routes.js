import {Router} from 'express';
import {Login, RecuperacionDeContrasenia, ComprobarTokenPassword, NuevaPassword, ConfirmacionCorreoNuevo} from '../controllers/para_todos_los_roles.js'
const router = Router()
//Rutas publicas
router.post("/login", Login);
router.get('/recuperacion/contrasenia', RecuperacionDeContrasenia);
router.get('/comprobar/token/:token', ComprobarTokenPassword);
router.patch('/nueva/contrasenia/:token', NuevaPassword);
router.get("/cambio/email/:token", ConfirmacionCorreoNuevo);

export default router