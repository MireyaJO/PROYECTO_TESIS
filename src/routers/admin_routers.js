import {Router} from 'express';
import {RegistroDeLosConductores, ActualizarRutasYSectoresId, BuscarConductorRuta,  ListarConductor, VisualizarPerfil,
    ActualizarInformacionAdmin, AsignarPrivilegiosDeAdmin, RegistrarNuevoAdmin, ActualizarPassword, ReemplazoTemporal, 
    ReemplazoPermanente, ActivarConductorOriginal, ListarReemplazoDisponibles, ListarConductoresConReemplazo, BuscarConductoresConReemplazo,
    CantidadReemplazosYActivacion, InformacionParaReporte, EliminarReemplazosDisponibles, AumentarPrivilegiosDeConductor
} from '../controllers/admin_controller.js'
import {verificacionAdminRol, verificacionToken} from '../middlewares/autho.js'
import {validacionesConductor, validacionesActualizarConductorNormal, validacionesActualizarPerfilAdmin, validacionesAdmin, validarContraseniaNueva} from '../middlewares/validaciones.js'
const router = Router()

//Rutas privadas
router.post('/registro/conductores', verificacionToken, verificacionAdminRol, validacionesConductor, RegistroDeLosConductores);
router.post('/registro/nuevo/admin', verificacionToken, verificacionAdminRol, validacionesAdmin, RegistrarNuevoAdmin);
router.post('/info/completa/reemplazos', verificacionToken, verificacionAdminRol, InformacionParaReporte);
router.patch('/actualizar/conductor/:idConductor', verificacionToken, verificacionAdminRol, validacionesActualizarConductorNormal, ActualizarRutasYSectoresId);
router.patch('/actualizar/informacion/admin', verificacionToken, verificacionAdminRol, validacionesActualizarPerfilAdmin, ActualizarInformacionAdmin);
router.patch('/asignar/privilegios/admin/:idAsignacion', verificacionToken, verificacionAdminRol, AsignarPrivilegiosDeAdmin);
router.patch('/actualizar/contrasenia/admin', verificacionToken, verificacionAdminRol, validarContraseniaNueva, ActualizarPassword); 
router.patch('/reemplazo/temporal/:idAntiguo/:idReemplazo', verificacionToken, verificacionAdminRol, ReemplazoTemporal);
router.patch('/reemplazo/permanente/:idAntiguo/:idReemplazo', verificacionToken, verificacionAdminRol, ReemplazoPermanente);
router.patch('/activar/conductor/original/:idConductor', verificacionToken, verificacionAdminRol, ActivarConductorOriginal);
router.patch('/aumentar/privilegios/conductor', verificacionToken, verificacionAdminRol, AumentarPrivilegiosDeConductor);
router.get('/listar/conductores', verificacionToken, verificacionAdminRol, ListarConductor);
router.get('/listar/reemplazo/disponibles', verificacionToken, verificacionAdminRol, ListarReemplazoDisponibles);
router.get('/buscar/conductor/ruta/:rutaAsignada', verificacionToken, BuscarConductorRuta);
router.get('/listar/conductores/conreemplazo', verificacionToken, verificacionAdminRol, ListarConductoresConReemplazo);
router.get('/buscar/conductor/conreemplazo/ruta/:rutaAsignada', verificacionToken, verificacionAdminRol, BuscarConductoresConReemplazo);
router.get('/info/cantidades', verificacionToken, verificacionAdminRol, CantidadReemplazosYActivacion); 
router.get('/visualizar/perfil/admin', verificacionToken, verificacionAdminRol, VisualizarPerfil);
router.delete('/eliminar/reemplazos/disponible/:idReemplazo', verificacionToken, verificacionAdminRol, EliminarReemplazosDisponibles);

export default router