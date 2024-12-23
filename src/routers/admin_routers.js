import {Router} from 'express';
import {RegistroDeLosConductores, LoginAdministrador, ActualizarRutasYSectores, BuscarConductor, BuscarConductorRuta,  ListarConductor, EliminarConductor} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
import {validacionesConductor} from '../middlewares/validaciones.js'
const router = Router()
//Ruta pública
router.post('/login/admin', LoginAdministrador)
//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, validacionesConductor, RegistroDeLosConductores)
router.get('/listar/conductores', verificacionToken, verificacionAdminRol, ListarConductor)
router.patch('/actualizar/conductor', verificacionToken, verificacionAdminRol, ActualizarRutasYSectores)
router.get('/buscar/conductor/:id', verificacionToken, verificacionAdminRol, BuscarConductor)
router.get('/buscar/conductor/ruta/:rutaAsignada', verificacionToken, BuscarConductorRuta)
router.delete('/eliminar/conductor/:id', verificacionToken, verificacionAdminRol, EliminarConductor)

export default router