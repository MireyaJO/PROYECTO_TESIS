import {Router} from 'express';
import {RegistroDeLosConductores, ActualizarRutasYSectoresId, BuscarConductorRuta,  ListarConductor, EliminarConductor, VisualizarPerfil,
    ActualizarInformacionAdmin, AsignarPrivilegiosDeAdmin, RegistrarNuevoAdmin
} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
import {validacionesConductor, validacionesActualizarConductorAdmin, validacionesActualizarPerfilAdmin, validacionesAdmin} from '../middlewares/validaciones.js'
const router = Router()

//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, validacionesConductor, RegistroDeLosConductores);
router.post('/registro/nuevo/admin', verificacionToken, verificacionAdminRol, validacionesAdmin, RegistrarNuevoAdmin);
router.get('/listar/conductores', verificacionToken, verificacionAdminRol, ListarConductor);
router.patch('/actualizar/conductor/:id', verificacionToken, verificacionAdminRol, validacionesActualizarConductorAdmin, ActualizarRutasYSectoresId);
router.patch('/actualizar/informacion/admin', verificacionToken, verificacionAdminRol, validacionesActualizarPerfilAdmin, ActualizarInformacionAdmin);
router.patch('/asignar/privilegios/admin/:id', verificacionToken, verificacionAdminRol, AsignarPrivilegiosDeAdmin);
router.get('/buscar/conductor/ruta/:rutaAsignada', verificacionToken, BuscarConductorRuta);
router.delete('/eliminar/conductor/:id', verificacionToken, verificacionAdminRol, EliminarConductor);
router.get('/visualizar/perfil/admin', verificacionToken, verificacionAdminRol, VisualizarPerfil);

export default router