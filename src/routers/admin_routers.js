import {Router} from 'express';
import {RegistroDeLosConductores, ActualizarRutasYSectoresId, BuscarConductorRuta,  ListarConductor, VisualizarPerfil,
    ActualizarInformacionAdmin, AsignarPrivilegiosDeAdmin, RegistrarNuevoAdmin, ActualizarPassword, ReemplazoTemporal, ReemplazoPermanente
} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
import {validacionesConductor, validacionesActualizarConductorAdmin, validacionesActualizarPerfilAdmin, validacionesAdmin, validarContraseniaNueva} from '../middlewares/validaciones.js'
const router = Router()

//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, validacionesConductor, RegistroDeLosConductores);
router.post('/registro/nuevo/admin', verificacionToken, verificacionAdminRol, validacionesAdmin, RegistrarNuevoAdmin);
router.get('/listar/conductores', verificacionToken, verificacionAdminRol, ListarConductor);
router.get('/buscar/conductor/ruta/:rutaAsignada', verificacionToken, BuscarConductorRuta);
router.get('/visualizar/perfil/admin', verificacionToken, verificacionAdminRol, VisualizarPerfil);
router.patch('/actualizar/conductor/:id', verificacionToken, verificacionAdminRol, validacionesActualizarConductorAdmin, ActualizarRutasYSectoresId);
router.patch('/actualizar/informacion/admin', verificacionToken, verificacionAdminRol, validacionesActualizarPerfilAdmin, ActualizarInformacionAdmin);
router.patch('/asignar/privilegios/admin/:idAsignacion', verificacionToken, verificacionAdminRol, AsignarPrivilegiosDeAdmin);
router.patch('/actualizar/contrasenia/admin', verificacionToken, verificacionAdminRol, validarContraseniaNueva, ActualizarPassword); 
router.patch('/reemplazo/temporal/:idAntiguo/:idReemplazor', verificacionToken, verificacionAdminRol, ReemplazoTemporal);
router.patch('/reemplazo/permanente/:idAntiguo/:idReemplazo', verificacionToken, verificacionAdminRol, ReemplazoPermanente);

export default router