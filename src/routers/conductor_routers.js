import {Router} from 'express';
import { RegistroDeLosEstudiantes, LoginConductor, ActualizarPassword, RecuperacionPassword, ComprobarTokenPassword, NuevaPassword, BuscarEstudiante, BuscarEstudianteCedula, 
    ActualizarEstudiante, ActualizarEstudianteCedula, EliminarEstudiante, ManejoActualizacionUbicacion, ListarEstudiantes } from '../controllers/conductor_controller.js';
import {verificacionConductorRol, verificacionToken} from '../middlewares/autho.js'
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
router.post('/actualizar/ubicacion', verificacionToken, verificacionConductorRol, (req, res) => {
    //Obtener los datos del cuerpo de la petición
    const {latitud, longitud } = req.body;
    const {id} = req.user;
    //Llamar a la función que actualiza la ubicación
    ManejoActualizacionUbicacion(req, res, id, latitud, longitud)
    .then(result => {
        // Mensaje de éxito
        res.json(result);
    })
    .catch(error => {
        // Mensaje de error
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar la ubicación', error });
    });
});
export default router