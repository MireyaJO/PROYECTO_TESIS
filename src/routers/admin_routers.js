import {Router} from 'express';
import {RegistroDeLosConductores, LoginAdministrador, ActualizarRutasYSectores, BuscarConductor, EliminarConductor} from '../controllers/admin_controller.js'
import {verifyToken} from '../middlewares/autho.js'
const router = Router()
router.post('/registro/conductores', RegistroDeLosConductores)
router.post('/login', LoginAdministrador)
router.get('/buscar/conductor/:id', BuscarConductor)
router.patch('/actualizar/conductor', ActualizarRutasYSectores)
router.delete('/eliminar/conductor/:id', EliminarConductor)

export default router