import {Router} from 'express';
import {RegistroDeLosConductores, LoginAdministrador, ActualizarRutasYSectores, BuscarConductor, EliminarConductor} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
const router = Router()
//Ruta pública
router.post('/login', LoginAdministrador)
//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, RegistroDeLosConductores)
router.get('/buscar/conductor/:id', verificacionToken, verificacionAdminRol, BuscarConductor)
router.patch('/actualizar/conductor', verificacionToken, verificacionAdminRol, ActualizarRutasYSectores)
router.delete('/eliminar/conductor/:id', verificacionToken, verificacionAdminRol, EliminarConductor)

export default router