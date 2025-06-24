import { check, validationResult } from 'express-validator'

//Validaciones para las rutas que manejsdel administrador
//Validaciones para el registro del conductor 
const validacionesConductor = [
    // Verificar que el campo "nombre" no esté vacío y que sea un string
    check("nombre")
    .exists()
        .withMessage('El campo "nombre" es obligatorio')
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo "nombre" debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el campo "apellido" no esté vacío y que sea un string
    check("apellido")
        .exists()
            .withMessage('El campo "apellido" es obligatorio')
        .notEmpty()
            .withMessage('El campo "apellido" no puede estar vacío')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
            .withMessage('El campo "apellido" debe ser un texto y puede contener espacios')
        .customSanitizer(value => value?.trim()),

    // Verificar que el campo "cooperativa" no esté vacío
    check("cooperativa")
        .exists()
            .withMessage('El campo "cooperativa" es obligatorio')
        .notEmpty()
            .withMessage('El campo "cooperativa" no puede estar vacío')
        .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .exists()
        .withMessage('El campo "telefono" es obligatorio')
    .notEmpty()
        .withMessage('El campo "telefono" no puede estar vacío')
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")
    .exists()
        .withMessage('El campo "cedula" es obligatorio')
    .notEmpty()
        .withMessage('El campo "cedula" no puede estar vacío')
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .exists()
        .withMessage('El campo "placaAutomovil" es obligatorio')
    .notEmpty()
        .withMessage('El campo "placaAutomovil" no puede estar vacío')
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/)
        .withMessage('El campo "placa" debe seguir el formato de tres letras mayúsculas, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .exists()
        .withMessage('El campo "email" es obligatorio')
    .notEmpty()
        .withMessage('El campo "email" no puede estar vacío')
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),

    // Verificar que el género sea uno de los valores permitidos
    check("generoConductor")
    .exists()
        .withMessage('El campo "generoConductor" es obligatorio')
    .notEmpty()
        .withMessage('El campo "generoConductor" no puede estar vacío')
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    //Verificar el valor del campo "esReemplazo"
    check("esReemplazo")
    .exists()
        .withMessage('El campo "esReemplazo" es obligatorio')
    .notEmpty()
        .withMessage('El campo "esReemplazo" no puede estar vacío')
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si es un reemplazo')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 rutaa
    check("rutaAsignada")
    .custom((value, { req }) => {
        if (req.body.esReemplazo === "No") {
            // Verificar si el valor está vacío o no definido
            if (!value || value.trim() === "") {
                throw new Error("Debe especificarse una ruta para conductores que no son reemplazo");
            }

            // Convertir el valor a número y verificar si es válido
            const num = Number(value.trim());
            if (isNaN(num)) {
                throw new Error("La ruta debe ser un número, no se acepta otro tipo de dato");
            }

            // Verificar que el número esté en el rango permitido
            if (num < 1 || num > 12) {
                throw new Error("Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús");
            }
        }
        return true;
    })
    .customSanitizer(value => value?.trim()),

    //Verificar que los sectores de la ruta no esten vacios cuando el conductor no es reemplazo
    check("sectoresRuta")
    .custom((value, { req }) => {
        if (req.body.esReemplazo === "No") {
            // Verificar si el valor está vacío o no definido
            if (!value || value.trim() === "") {
                throw new Error("Los sectores de la ruta no pueden estar vacíos para conductores que no son reemplazo");
            }
        } 
        return true;
    })
    .customSanitizer(value => value?.trim()),
    
    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
     }
]

//Validaciones para el registrar un nuevo administrador
const validacionesAdmin = [
    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["nombre"])
    .exists()
        .withMessage('El campo "nombre" es obligatorio')
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')     
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["apellido"])
    .exists()
        .withMessage('El campo "apellido" es obligatorio')
    .notEmpty()
        .withMessage('El campo "apellido" no puede estar vacío')     
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .exists()
        .withMessage('El campo "telefono" es obligatorio')
    .notEmpty()
        .withMessage('El campo "telefono" no puede estar vacío')  
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")
    .exists()
        .withMessage('El campo "cedula" es obligatorio')
    .notEmpty()
        .withMessage('El campo "cedula" no puede estar vacío')  
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que la cooperativa no este vacío
    check("cooperativa")
    .exists()
        .withMessage('El campo "cooperativa" es obligatorio')
    .notEmpty()
        .withMessage('El campo "cooperativa" no puede estar vacío')  
    .customSanitizer(value => value?.trim()), 
    
    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .exists()
        .withMessage('El campo "placaAutomovil" es obligatorio')
    .notEmpty()
        .withMessage('El campo "placaAutomovil" no puede estar vacío')  
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .exists()
        .withMessage('El campo "email" es obligatorio')
    .notEmpty()
        .withMessage('El campo "email" no puede estar vacío')  
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que el género sea uno de los valores permitidos
    check("generoConductor")
    .exists()
        .withMessage('El campo "generoConductor" es obligatorio')
    .notEmpty()
        .withMessage('El campo "generoConductor" no puede estar vacío')  
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    // Verificar que los campos de eliminación, asignación y trabajo solo acepten "Sí" o "No"
    check("eliminacionAdminSaliente")
    .exists()
        .withMessage('El campo "eliminacionAdminSaliente" es obligatorio')
    .notEmpty()
        .withMessage('El campo "eliminacionAdminSaliente" no puede estar vacío')  
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si el conductor admin actual será eliminado') 
    .customSanitizer(value => value?.trim()),
    
    check("asignacionOno")
    .if(({ req }) => req.body.roles?.includes("admin"))
    .exists()
        .withMessage('El campo "asignacionOno" es obligatorio')
    .notEmpty()
        .withMessage('El campo "asignacionOno" no puede estar vacío')  
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si los estudiantes del conductor admin actual serán asignados al nuevo conductor admin')
    .customSanitizer(value => value?.trim()),

    check("trabajaraOno")
    .exists()
        .withMessage('El campo "trabajaraOno" es obligatorio')
    .notEmpty()
        .withMessage('El campo "trabajaraOno" no puede estar vacío')  
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si el nuevo conductor admin tendrá privilegios de conductor')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 rutaa
    check("rutaAsignada")
    .custom((value, { req }) => {
        if (req.body.trabajaraOno === "Sí" && req.body.asignacionOno === "No") {
            // Verificar si el valor está vacío o no definido
            if (!value || value.trim() === "") {
                throw new Error("Debe especificarse una ruta nueva para el nuevo conductor admin");
            }

            // Convertir el valor a número y verificar si es válido
            const num = Number(value.trim());
            if (isNaN(num)) {
                throw new Error("La ruta debe ser un número, no se acepta otro tipo de dato");
            }

            // Verificar que el número esté en el rango permitido
            if (num < 1 || num > 12) {
                throw new Error("Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús");
            }
        }
        return true;
    })
    .customSanitizer(value => value?.trim()),

    //Verificar que los sectores de la ruta no esten vacios cuando el conductor no es reemplazo
    check("sectoresRuta")
    .custom((value, { req }) => {
        if (req.body.trabajaraOno === "Sí" && req.body.asignacionOno === "No") {
            // Verificar si el valor está vacío o no definido
            if (!value || value.trim() === "") {
                throw new Error("Los sectores de la ruta no pueden estar vacíos para conductores que no son reemplazo");
            }
        } 
        return true;
    })
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

//Validaciones para la actualizacion de un conductor
const validacionesActualizarConductorNormal = [
    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["nombre"])
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')      
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')  
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["apellido"])    
    .notEmpty()
        .withMessage('El campo "apellido" no puede estar vacío') 
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["cooperativa"])    
    .notEmpty()
        .withMessage('El campo "cooperativa" no puede estar vacío') 
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")  
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .notEmpty()
        .withMessage('El campo "placaAutomovil" no puede estar vacío') 
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 ruta
    check("rutaAsignada")
    .notEmpty()
        .withMessage('El campo "rutaAsignada" no puede estar vacío') 
    .isNumeric()
        .withMessage('La ruta debe ser un número, no se acepta otro tipo de dato')
    .isInt({ min: 1, max: 12 })
        .withMessage('Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús')
    .customSanitizer(value => (typeof value === 'string' ? value.trim() : value)),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["sectoresRuta"])    
    .notEmpty()
        .withMessage('El campo "sectoresRuta" no puede estar vacío') 
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

//Validaciones para la actualizacion de un conductor admin
const validacionesActualizarPerfilAdmin = [
    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["nombre"])   
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')  
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["apellido"]) 
    .notEmpty()
        .withMessage('El campo "apellido" no puede estar vacío')      
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .notEmpty()
        .withMessage('El campo "telefono" no puede estar vacío')  
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()), 

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula") 
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    //Verificación de que el nombre no se encuentre vacío y sea un string
    check(["cooperativa"])    
    .notEmpty()
        .withMessage('El campo "cooperativa" no puede estar vacío') 
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .notEmpty()
        .withMessage('El campo "placaAutomovil" no puede estar vacío')  
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/)
        .withMessage('El campo "placa" debe seguir el formato de tres letras mayúsculas, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .notEmpty()
        .withMessage('El campo "email" no puede estar vacío')  
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

//Validaciones en la que el conductor logeado cambia su contrasenia
const validarContraseniaNueva = [
    check("passwordAnterior")
    .exists()
        .withMessage('Los campos "passwordAnterior" son obligatorios')
    .notEmpty()
        .withMessage('Los campos "passwordAnterior"  no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que la contraseña tenga un mínimo de 6 y un máximo de 10 caracteres, y que contenga al menos 3 números y 3 signos especiales
    check("passwordActual")
    .exists()
        .withMessage('El campo "passwordActual" es obligatorio')
    .notEmpty()
        .withMessage('El campo "passwordActual" no puede estar vacío') 
    .isLength({ min: 6, max: 10 })
        .withMessage('La contraseña debe tener entre 6 y 10 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=(?:.*\d){3})(?=(?:.*[^A-Za-z0-9]){3})/)        
        .withMessage('La contraseña debe contener letras, al menos 3 números y 3 signos especiales')
    .customSanitizer(value => value?.trim()),

    check("passwordActualConfirm")
    .exists()
        .withMessage('El campo "passwordActualConfirm" es obligatorio')
    .notEmpty()
        .withMessage('El campo "passwordActualConfirm" no puede estar vacío') 
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

//Validaciones en la que el conductor no esta logeado cambia su contrasenia
const validacionesRecuperacion = [
    check(["passwordActual", "passwordActualConfirm"])
    .exists()
        .withMessage('Los campos "passwordActual" y/o "passwordActualConfirm" son obligatorios')
    .notEmpty()
        .withMessage('Los campos "passwordActual" y/o "passwordActualConfirm" no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que la contraseña tenga un mínimo de 8 y un máximo de 10 caracteres, y que contenga al menos 3 números y 3 signos especiales
    check("passwordActual")
        .isLength({ min: 8, max: 10 })
        .withMessage('La contraseña debe tener entre 6 y 10 caracteres')
        .matches(/^(?=.*[A-Za-z])(?=(?:.*\d){3})(?=(?:.*[^A-Za-z0-9]){3})/)        
        .withMessage('La contraseña debe contener letras, al menos 3 números y 3 signos especiales')
        .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

//Validaciones para las rutas que manejará el conductor 
//Validaciones para el registro del estudiante
const validacionesEstudiantes = [
    //Verificación que "nombre" sea un string y no se encuentre vacío
    check(["nombre"])
    .exists()
        .withMessage('El campo "nombre" es obligatorio')
    .notEmpty()
        .withMessage('El campo "nombre" no puede estar vacío')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    //Verificación que "apellido"sea un string y no se encuentre vacío
    check(["apellido"])
    .exists()
        .withMessage('El campo "apellido" es obligatorio')
    .notEmpty()
        .withMessage('El campo "apellido" no puede estar vacío')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el campo "nivelEscolar" sea uno de los valores permitidos
    check("nivelEscolar")
    .exists()
        .withMessage('El campo "nivelEscolar" es obligatorio')
    .notEmpty()
        .withMessage('El campo "nivelEscolar" no puede estar vacío')
    .isIn(["Nocional", "Inicial 1", "Inicial 2", "Primero de básica", "Segundo de básica", "Tercero de básica", "Cuarto de básica", "Quinto de básica", 
        "Sexto de básica", "Séptimo de básica", "Octavo de básica", "Noveno de básica", "Décimo de básica", "Primero de bachillerato", "Segundo de bachillerato", "Tercero de bachillerato"])
        .withMessage('Lo sentimos, el nivel escolar debe ser Educación Inicial, Educación General Básica o Educación Media (Bachillerato)') 
    .customSanitizer(value => value?.trim()),

    // Verificar que el campo "paralelo" sea uno de los valores permitidos
    check("paralelo")
    .exists()
        .withMessage('El campo "paralelo" es obligatorio')
    .notEmpty()
        .withMessage('El campo "paralelo" no puede estar vacío')
    .isIn(["A", "B", "C"])
        .withMessage('Lo sentimos, el paralelo debe ser de la A a la C')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")
    .exists()
        .withMessage('El campo "cedula" es obligatorio')
    .notEmpty()
        .withMessage('El campo "cedula" no puede estar vacío')
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),  

    // Verificar que el número de cédula tenga 10 dígitos
    check("ubicacionDomicilio")
    .exists()
        .withMessage('El campo "ubicacionDomicilio" es obligatorio')
    .notEmpty()
        .withMessage('El campo "ubicacionDomicilio" no puede estar vacío')
    .customSanitizer(value => value?.trim()), 

    // Verificar que el numero de cedula sea de 10 digitos
    check("genero")
    .exists()
        .withMessage('El campo "genero" es obligatorio')
    .notEmpty()
        .withMessage('El campo "genero" no puede estar vacío')
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    // Verificar que el "turno" sea uno de los valores permitidos
    check("turno")
    .exists()
        .withMessage('El campo "turno" es obligatorio')
    .notEmpty()
        .withMessage('El campo "turno" no puede estar vacío')
    .isIn(["Mañana", "Tarde", "Completo"])
        .withMessage('El turno debe ser "Mañana", "Tarde" o "Completo"')
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

const validacionesActualizarEstudiante = [
    // Verificar que se encuentren los campos obligatorios y no estén vacíos
    check(["nivelEscolar", "paralelo",  "ubicacionDomicilio", "turno"
    ])
    .exists()
        .withMessage('Los campos "nivelEscolar", "paralelo", "ubicacionDomicilio" y/o "turno"  son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nivelEscolar", "paralelo", "ubicacionDomicilio" y/o "turno"  no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),

    // Verificar que el campo "nivelEscolar" sea uno de los valores permitidos
    check("nivelEscolar")
    .isIn(["Nocional", "Inicial 1", "Inicial 2", "Primero de básica", "Segundo de básica", "Tercero de básica", "Cuarto de básica", "Quinto de básica", 
        "Sexto de básica", "Séptimo de básica", "Octavo de básica", "Noveno de básica", "Décimo de básica", "Primero de bachillerato", "Segundo de bachillerato", "Tercero de bachillerato"])
        .withMessage('Lo sentimos, el nivel escolar debe ser Educación Inicial, Educación General Básica o Educación Media (Bachillerato)') 
    .customSanitizer(value => value?.trim()),

    // Verificar que el campo "paralelo" sea uno de los valores permitidos
    check("paralelo")
    .isIn(["A", "B", "C"])
        .withMessage('Lo sentimos, el paralelo debe ser de la A a la C')
    .customSanitizer(value => value?.trim()),

    // Verificar que el "turno" sea uno de los valores permitidos
    check("turno")
    .isIn(["Mañana", "Tarde", "Completo"])
        .withMessage('El turno debe ser "Mañana", "Tarde" o "Completo"')
    .customSanitizer(value => value?.trim()), 

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

const validacionesActualizarPerfilConductor = [
    // Verificar que no hayan campos vacíos 
    check(["telefono", "email"])
    .notEmpty()
        .withMessage('Se necesita campos para actualizar')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),
    
    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

/*const validacionesRepresentantes = [
    // Verificar que se encuentren los campos obligatorios y no estén vacíos
     check(["nombre","apellido","telefono","cedula", "institucion", "email", "password", "cedulaRepresentado"
    ])
    .exists()
        .withMessage('Los campos "nombre","apellido","telefono","cedula", "institucion", "fotografia", "password" y/o "email"  son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nombre","apellido","telefono","cedula", "institucion", "fotografia", "password" y/o "email" no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),

    //Verificación de que todo sea un string
    check(["nombre", "apellido"])
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .isNumeric()
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()), 

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),

    //Verificar la institución
    check("institucion")
    .equals("Unidad Educativa Particular Emaús")
        .withMessage('La institución debe ser la Unidad Educativa Particular Emaús')
    .isString()
        .withMessage('La institución debe ser un texto, no se acepta otro tipo de dato')
        .customSanitizer(value => value?.trim()),
    
    // Verificar que la contraseña tenga un mínimo de 6 y un máximo de 10 caracteres, y que contenga al menos 3 números y 3 signos especiales
    check("password")
        .isLength({ min: 6, max: 10 })
        .withMessage('La contraseña debe tener entre 6 y 10 caracteres')
        .matches(/^(?=.*[A-Za-z])(?=(?:.*\d){3})(?=(?:.*[!@#$%^&*()\-_=+{};:,<.>]){3})/)
        .withMessage('La contraseña debe contener al menos 3 números y 3 signos especiales')
        .customSanitizer(value => value?.trim()),

    // Verificar que el género sea uno de los valores permitidos
    check("genero")
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]

const validacionesActualizarPerfilRepresentante = [
    //Verificación de que todo sea un string
    check(["nombre", "apellido"])
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("cedula")
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .isNumeric()
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()), 

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),

    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            //Solo se muestra el primer error no el array completo
            const Error = errors.array()[0]; 
            return res.status(400).send({ error: Error});
        }
    }
]*/

export {
    validacionesAdmin,
    validacionesConductor, 
    validacionesActualizarConductorNormal, 
    validacionesActualizarPerfilConductor, 
    validacionesEstudiantes,
    validacionesActualizarEstudiante, 
    validarContraseniaNueva, 
    validacionesRecuperacion,
    validacionesActualizarPerfilAdmin, 
    /*validacionesRepresentantes,
    validacionesActualizarPerfilRepresentante*/
}