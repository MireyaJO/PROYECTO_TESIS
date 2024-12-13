import Conductores from '../models/Administrador.js';
import enviarCorreoConductor from "../config/nodemailer.js"; 
import { createToken } from '../middlewares/autho.js';
import Estudiantes from '../models/Estudiantes.js';

//Registro de los estudiantes
const RegistroDeLosEstudiantes = async (req, res) => {
    // Extraer los campos del cuerpo de la solicitud
    const {
        nombreEstudiante,
        apellidoEstudiante,
        nivelEscolar,
        paralelo,
        numeroDeCedula,
        ubicacionEstudiante,
        recoCompletoOMedio
    } = req.body;

    // Verificar que no haya campos vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    // Comprobar el tamaño de la cedula
    if(numeroDeCedula.toString().length !== 10){
        return res.status(400).json({ msg: "Lo sentimos, el número de cédula debe tener 10 dígitos" });
    }

    //Comprobar que el nivel escolar se encuentre bien escrito 
    if(nivelEscolar !== "Nocional" && nivelEscolar !== "Inicial 1" && nivelEscolar !== "Inicial 2"
        && nivelEscolar !== "Primero de básica" && nivelEscolar !== "Segundo de básica" && nivelEscolar !== "Tercero de básica"
        && nivelEscolar !== "Cuarto de básica" && nivelEscolar !== "Quinto de básica" && nivelEscolar !== "Sexto de básica"
        && nivelEscolar !== "Séptimo de básica" && nivelEscolar !== "Octavo de básica" && nivelEscolar !== "Noveno de básica"
        && nivelEscolar !== "Décimo de básica" && nivelEscolar !== "Primero de bachillerato" && nivelEscolar !== "Segundo de bachillerato"
        && nivelEscolar !== "Tercero de bachillerato"
    ){
        return res.status(400).json({ msg: "Lo sentimos, el nivel escolar debe ser Educación Inicial, Educación General Básica o Educación Media (Bachillerato)" });
    }

    //Comprobar el paralelo en el que se encuentra el estudiante
    if(paralelo !== "A" && paralelo !== "B" && paralelo !== "C" ){
        return res.status(400).json({ msg: "Lo sentimos, el paralelo debe ser de la A a la C" });
    }

    //Comprobación de que sea un link de google maps
    const carateresGoogleMaps = /^https:\/\/maps\.app\.goo\.gl\/[a-zA-Z0-9]+$/;
    if (!carateresGoogleMaps.test(ubicacionEstudiante)) {
        return res.status(400).json({ msg: "Lo sentimos, el link de ubicación debe ser de google maps" });
    }

    // Crear un nuevo estudiante con los datos proporcionados
    const nuevoEstudiante = new Estudiantes(req.body);
    try {
        await nuevoEstudiante.save();
        res.status(201).json({ msg: "Estudiante registrado exitosamente", nuevoEstudiante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el estudiante" });
    }
}
