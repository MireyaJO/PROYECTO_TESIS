import {Router} from 'express';
import { RegistroDeLosEstudiantes, ActualizarPassword, BuscarEstudianteCedula, 
    ActualizarEstudiante, EliminarEstudiante, ManejoActualizacionUbicacion, ListarEstudiantes, VisuallizarPerfil, ActualizarPerfil, 
    TomarListaTarde, BuscarLista, EliminarLista, ActualizarLista} from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
import { validacionesActualizarPerfilConductor, validacionesActualizarEstudiante } from '../middlewares/validaciones.js';
const router = Router();

//Rutas Privadas
router.patch('/actualizar/contrasenia/conductor', verificacionToken, verificacionConductorRol, ActualizarPassword); 
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, RegistroDeLosEstudiantes); 
router.get('/lista/estudiantes', verificacionToken, verificacionConductorRol, ListarEstudiantes);
router.get('/buscar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, BuscarEstudianteCedula);
router.patch('/actualizar/estudiante/:id', verificacionToken, verificacionConductorRol, validacionesActualizarEstudiante, ActualizarEstudiante);
router.delete('/eliminar/estudiante/:id', verificacionToken, verificacionConductorRol, EliminarEstudiante);
router.post('/actualizar/ubicacion', verificacionToken, verificacionConductorRol, ManejoActualizacionUbicacion);
router.get('/perfil/conductor', verificacionToken, verificacionConductorRol, VisuallizarPerfil);
router.patch('/actualizar/perfil/conductor', verificacionToken, verificacionConductorRol, validacionesActualizarPerfilConductor, ActualizarPerfil);
router.post('/tomar/asistencia/tarde', verificacionToken, verificacionConductorRol, TomarListaTarde);
router.get('/buscar/asistencia/fecha/:fecha', verificacionToken, verificacionConductorRol, BuscarLista);
router.delete('/eliminar/asistencia/id/:listaId', verificacionToken, verificacionConductorRol, EliminarLista);
router.patch('/actualizar/asistencia/:listaId', verificacionToken, verificacionConductorRol, ActualizarLista);

export default router