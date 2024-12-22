import {Router} from 'express';
import { RegistroDeLosEstudiantes, LoginConductor, ActualizarPassword, RecuperacionPassword, ComprobarTokenPassword, NuevaPassword, BuscarEstudiante, BuscarEstudianteCedula, 
    ActualizarEstudiante, ActualizarEstudianteCedula, EliminarEstudiante, ManejoActualizacionUbicacion, ListarEstudiantes, VisuallizarPerfil, ActualizarPerfil } from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
import { validacionesActualizarPerfilConductor } from '../middlewares/validaciones.js';
const router = Router();
//Rutas Públicas
router.post('/login/conductor', LoginConductor);
router.post('/recuperacion/contrasenia', RecuperacionPassword);
router.get('/comprobar/token/:token', ComprobarTokenPassword);
router.patch('/nueva/contrasenia/:token', NuevaPassword); 

//Rutas Privadas
router.post('/registro/estudiantes', verificacionToken, verificacionConductorRol, RegistroDeLosEstudiantes);
router.patch('/actualizar/contrasenia', verificacionToken, verificacionConductorRol, ActualizarPassword);  
router.get('/lista/estudiantes', verificacionToken, verificacionConductorRol, ListarEstudiantes);
router.get('/buscar/estudiante/:id', verificacionToken, verificacionConductorRol, BuscarEstudiante);
router.get('/buscar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, BuscarEstudianteCedula);
router.patch('/actualizar/estudiante/:id', verificacionToken, verificacionConductorRol, ActualizarEstudiante);
router.patch('/actualizar/estudiante/cedula/:cedula', verificacionToken, verificacionConductorRol, ActualizarEstudianteCedula);
router.delete('/eliminar/estudiante/:id', verificacionToken, verificacionConductorRol, EliminarEstudiante);
router.post('/actualizar/ubicacion', verificacionToken, verificacionConductorRol, ManejoActualizacionUbicacion);
router.get('/perfil/conductor', verificacionToken, verificacionConductorRol, VisuallizarPerfil);
router.patch('/actualizar/perfil/conductor', verificacionToken, verificacionConductorRol, validacionesActualizarPerfilConductor, ActualizarPerfil);
    
export default router