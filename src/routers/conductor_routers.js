import {Router} from 'express';
import { RegistroDeLosEstudiantes, LoginConductor, ActualizarPassword, RecuperacionPassword, ComprobarTokenPassword, NuevaPassword, BuscarEstudiante, BuscarEstudianteCedula, 
    ActualizarEstudiante, ActualizarEstudianteCedula, EliminarEstudiante, ManejoActualizacionUbicacion, ListarEstudiantes, VisuallizarPerfil, ActualizarPerfil, 
    TomarListaManana, TomarListaTarde, BuscarListaId, BuscarLista, EliminarLista, EliminarListaFecha, ConfirmacionCorreoNuevoConductor} from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
import { validacionesActualizarPerfilConductor, validacionesActualizarEstudiante } from '../middlewares/validaciones.js';
const router = Router();
//Rutas Públicas
router.post('/login/conductor', LoginConductor);
router.post('/recuperacion/contrasenia/conductor', RecuperacionPassword);
router.get('/comprobar/token/conductor/:token', ComprobarTokenPassword);
router.patch('/nueva/contrasenia/conductor/:token', NuevaPassword); 
router.get("/cambio/emailConductor/:token", ConfirmacionCorreoNuevoConductor);


//Rutas Privadas
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, RegistroDeLosEstudiantes);
router.patch('/actualizar/contrasenia/conductor', verificacionToken, verificacionConductorRol, ActualizarPassword);  
router.get('/lista/estudiantes', verificacionToken, verificacionConductorRol, ListarEstudiantes);
router.get('/buscar/estudiante/:id', verificacionToken, verificacionConductorRol, BuscarEstudiante);
router.get('/buscar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, BuscarEstudianteCedula);
router.patch('/actualizar/estudiante/:id', verificacionToken, verificacionConductorRol, validacionesActualizarEstudiante, ActualizarEstudiante);
router.patch('/actualizar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, validacionesActualizarEstudiante, ActualizarEstudianteCedula);
router.delete('/eliminar/estudiante/:id', verificacionToken, verificacionConductorRol, EliminarEstudiante);
router.post('/actualizar/ubicacion', verificacionToken, verificacionConductorRol, ManejoActualizacionUbicacion);
router.get('/perfil/conductor', verificacionToken, verificacionConductorRol, VisuallizarPerfil);
router.patch('/actualizar/perfil/conductor', verificacionToken, verificacionConductorRol, validacionesActualizarPerfilConductor, ActualizarPerfil);
router.post('/tomar/asistencia/manana', verificacionToken, verificacionConductorRol, TomarListaManana);
router.post('/tomar/asistencia/tarde', verificacionToken, verificacionConductorRol, TomarListaTarde);
router.get('/buscar/asistencia/id/:listaId', verificacionToken, verificacionConductorRol, BuscarListaId);
router.get('/buscar/asistencia/fecha/:fecha', verificacionToken, verificacionConductorRol, BuscarLista);
router.delete('/eliminar/asistencia/id/:listaId', verificacionToken, verificacionConductorRol, EliminarLista);
router.delete('/eliminar/asistencia/fecha/:fecha', verificacionToken, verificacionConductorRol, EliminarListaFecha);

export default router