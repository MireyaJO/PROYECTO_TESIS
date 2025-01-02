import {Router} from 'express';
import {RegistroDeLosConductores, LoginAdministrador, ActualizarRutasYSectoresId, ActualizarRutasYSectoresCedula, BuscarConductor, BuscarConductorRuta,  ListarConductor, EliminarConductor} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
import {validacionesConductor, validacionesActualizarConductorAdmin} from '../middlewares/validaciones.js'
const router = Router()
//Ruta pública
router.post('/login/admin', LoginAdministrador)
//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, validacionesConductor, RegistroDeLosConductores)
router.get('/listar/conductores', verificacionToken, verificacionAdminRol, ListarConductor)
router.patch('/actualizar/conductor/:id', verificacionToken, verificacionAdminRol, validacionesActualizarConductorAdmin, ActualizarRutasYSectoresId)
router.patch('/actualizar/conductor/cedula/:cedula', verificacionToken, verificacionAdminRol, validacionesActualizarConductorAdmin, ActualizarRutasYSectoresCedula)
router.get('/buscar/conductor/:id', verificacionToken, verificacionAdminRol, BuscarConductor)
router.get('/buscar/conductor/ruta/:rutaAsignada', verificacionToken, BuscarConductorRuta)
router.delete('/eliminar/conductor/:id', verificacionToken, verificacionAdminRol, EliminarConductor)

export default router