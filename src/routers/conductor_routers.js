import {Router} from 'express';
import { RegistroDeLosEstudiantes, ActualizarPassword, BuscarEstudianteCedula, 
    ActualizarEstudiante, EliminarEstudiante, ManejoActualizacionUbicacion, CalcularDistanciaYTiempo, TodosLosEstudiantes, ListarEstudiantesManiana, ListarEstudiantesTarde,
    ListarAsistenciasTarde, ListarAsistenciasManiana, VisuallizarPerfil, ActualizarPerfil, TomarLista, BuscarLista, EliminarLista, ActualizarLista} from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
import { validacionesActualizarPerfilConductor, validacionesActualizarEstudiante, validarContraseniaNueva, validacionesEstudiantes} from '../middlewares/validaciones.js';
const router = Router();

//Rutas Privadas
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, validacionesEstudiantes, RegistroDeLosEstudiantes); 
router.post('/tomar/asistencia', verificacionToken, verificacionConductorRol, TomarLista);
router.post('/tiempo/distancia', verificacionToken, verificacionConductorRol, CalcularDistanciaYTiempo);
router.patch('/actualizar/contrasenia/conductor', verificacionToken, verificacionConductorRol, validarContraseniaNueva, ActualizarPassword); 
router.patch('/actualizar/estudiante/:id', verificacionToken, verificacionConductorRol, validacionesActualizarEstudiante, ActualizarEstudiante);
router.patch('/actualizar/ubicacion', verificacionToken, verificacionConductorRol, ManejoActualizacionUbicacion);
router.patch('/actualizar/perfil/conductor', verificacionToken, verificacionConductorRol, validacionesActualizarPerfilConductor, ActualizarPerfil);
router.patch('/actualizar/asistencia/:listaId', verificacionToken, verificacionConductorRol, ActualizarLista);
router.delete('/eliminar/estudiante/:id', verificacionToken, verificacionConductorRol, EliminarEstudiante);
router.delete('/eliminar/asistencia/id/:listaId', verificacionToken, verificacionConductorRol, EliminarLista);
router.get('/lista/estudiantes', verificacionToken, verificacionConductorRol, TodosLosEstudiantes);
router.get('/lista/estudiantes/maniana', verificacionToken, verificacionConductorRol, ListarEstudiantesManiana);
router.get('/lista/estudiantes/tarde', verificacionToken, verificacionConductorRol, ListarEstudiantesTarde);
router.get('/buscar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, BuscarEstudianteCedula);
router.get('/listar/asistencia/maniana', verificacionToken, verificacionConductorRol, ListarAsistenciasManiana);
router.get('/listar/asistencia/tarde', verificacionToken, verificacionConductorRol, ListarAsistenciasTarde);
router.get('/perfil/conductor', verificacionToken, verificacionConductorRol, VisuallizarPerfil);
router.get('/buscar/asistencia/fecha/:fecha', verificacionToken, verificacionConductorRol, BuscarLista);


export default router