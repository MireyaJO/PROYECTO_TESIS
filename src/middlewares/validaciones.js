import { check, validationResult } from 'express-validator'
//Validaciones para las rutas del administrador
//Validaciones para el registro del conductor 
const validacionesConductor = [
    // Verificar que se encuentren los campos obligatorios y no estén vacíos
    check(["nombre","apellido", "cooperativa", "telefono","cedula","placaAutomovil", 
        "email", "generoConductor", "esReemplazo"
    ])
    .exists()
        .withMessage('Los campos "nombre","apellido","cooperativa","telefono","cedula","placaAutomovil", "fotografiaDelConductor", "generoConductor", "esReemplazo" y/o "email"  son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nombre","apellido","cooperativa","telefono","cedula","placaAutomovil", "fotografiaDelConductor", "generoConductor", "esReemplazo" y/o "email" no pueden estar vacíos')
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
    
    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 rutaa
    check("rutaAsignada")
    .isNumeric()
        .withMessage('La ruta debe ser un número, no se acepta otro tipo de dato')
    .isInt({ min: 1, max: 12 })
        .withMessage('Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),

    // Verificar que el género sea uno de los valores permitidos
    check("generoConductor")
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    //Verificar el valor del campo "esReemplazo"
    check("esReemplazo")
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si es un reemplazo')
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
    // Verificar que se encuentren los campos obligatorios y no estén vacíos
    check(["nombre","apellido","telefono","cedula","placaAutomovil","email", "generoConductor", "fotografiaDelConductor", 
        "trabajaraOno", "asignacionOno", "eliminacionAdminSaliente"
    ])
    .exists()
        .withMessage('Los campos "nombre","apellido","telefono","cedula","placaAutomovil", "fotografiaDelConductor", "generoConductor", "trabajaraOno", "asignacionOno", "eliminacionAdminSaliente" y/o "email"  son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nombre","apellido","telefonor","cedula","placaAutomovil", "fotografiaDelConductor", "generoConductor", "trabajaraOno", "asignacionOno", "eliminacionAdminSaliente" y/o "email" no pueden estar vacíos')
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
    
    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .isLength({ min: 7, max: 7 })
        .withMessage('La placa debe ser de 7 digitos')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("email")
    .isEmail()
        .withMessage('El email debe ser un correo válido')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que el género sea uno de los valores permitidos
    check("generoConductor")
    .isIn(["Femenino", "Masculino", "Prefiero no decirlo"])
        .withMessage('El género debe ser "Femenino", "Masculino" o "Prefiero no decirlo"')
    .customSanitizer(value => value?.trim()),

    // Verificar que los campos de eliminación, asignación y trabajo solo acepten "Sí" o "No"
    check("eliminacionAdminSaliente")
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si el conductor admin actual será eliminado') 
    .customSanitizer(value => value?.trim()),
    
    check("asignacionOno")
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si los estudiantes del conductor admin actual serán asignados al nuevo conductor admin')
    .customSanitizer(value => value?.trim()),

    check("trabajaraOno")
    .isIn(["Sí", "No"])
        .withMessage('Solo se admiten los valores "Sí" o "No" para afirmar si el nuevo conductor admin tendrá privilegios de conductor')
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
    // Verificar que se encuentren los campos obligatorios y no estén vacíos
    check(["rutaAsignada","sectoresRuta"])
    .notEmpty()
        .withMessage('Los campos "rutaAsignada" y/o "sectoresRuta" no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 ruta
    check("rutaAsignada")
    .isNumeric()
        .withMessage('La ruta debe ser un número, no se acepta otro tipo de dato')
    .isInt({ min: 1, max: 12 })
        .withMessage('Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús')
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

const validacionesActualizarPerfilAdmin = [
    // Verificar que el numero de telefono sea de 10 digitos
    check("telefono")
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .matches(/^\d{10}$/)
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()), 

    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .isLength({ min: 7, max: 7 })
        .withMessage('La placa debe ser de 7 digitos')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número y que solo existan 12 rutaa
    check("rutaAsignada")
    .isNumeric()
        .withMessage('La ruta debe ser un número, no se acepta otro tipo de dato')
    .isInt({ min: 1, max: 12 })
        .withMessage('Solo existen 12 rutas disponibles en la Unidad Educativa Particular Emaús')
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

const validarContraseniaNueva = [
    check(["passwordAnterior", "passwordActual", "passwordActualConfirm"])
    .exists()
        .withMessage('Los campos "passwordAnterior", "passwordActual" y/o "passwordActualConfirm" son obligatorios')
    .notEmpty()
        .withMessage('Los campos "passwordAnterior", "passwordActual" y/o "passwordActualConfirm" no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),
    
    // Verificar que la contraseña tenga un mínimo de 6 y un máximo de 10 caracteres, y que contenga al menos 3 números y 3 signos especiales
    check("passwordActual")
        .isLength({ min: 6, max: 10 })
        .withMessage('La contraseña debe tener entre 6 y 10 caracteres')
        .matches(/^(?=.*[A-Za-z])(?=(?:.*\d){3})(?=(?:.*[!@#$%^&*()\-_=+{};:,<.>]){3})/)
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

const validacionesRepresentantes = [
     // Verificar que se encuentren los campos obligatorios y no estén vacíos
     check(["nombre","apellido","telefono","cedula", "institucion", "email", "password", "cedulaRepresentado"
    ])
    .exists()
        .withMessage('Los campos "nombre","apellido","telefono","cedula"", "institucion", "fotografia", "password" y/o "email"  son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nombre","apellido","telefono","cedula"", "institucion", "fotografia", "password" y/o "email" no pueden estar vacíos')
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
            return res.status(400).send({ errors: errors.array() });
        }
    }
    
    
]

const validacionesActualizarPerfilConductor = [
    // Verificar que no hayan campos vacíos 
    check(["telefono","placaAutomovil", "email"])
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

    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .isLength({ min: 8, max: 8 })
        .withMessage('La placa debe tener exactamente 8 caracteres, incluyendo el guion')
    .matches(/^[A-Z]{3}-\d{4}$/i)
        .withMessage('El campo "placa" debe seguir el formato de tres letras, un guion y cuatro números,  Ejemplo: PUH-7869')
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
            return res.status(400).send({ errors: errors.array() });
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
            return res.status(400).send({ errors: errors.array() });
        }
    }
]

const validacionesActualizarEstudiante = [
    //Verificación de que todo sea un string
    check(["nombre", "apellido"])
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El campo debe ser un texto y puede contener espacios')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de cedula sea de 10 digitos
    check("cedula")
    .isLength({ min: 10, max: 10 })
        .withMessage('La cedula debe ser de 10 digitos')
    .isNumeric()
        .withMessage('El campo "cedula" debe contener solo números')
    .customSanitizer(value => value?.trim()),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            return res.status(400).send({ errors: errors.array() });
        }
    }
]

export {
    validacionesAdmin,
    validacionesConductor, 
    validacionesRepresentantes, 
    validacionesActualizarConductorNormal, 
    validacionesActualizarPerfilConductor, 
    validacionesActualizarPerfilRepresentante,
    validacionesActualizarEstudiante, 
    validarContraseniaNueva, 
    validacionesActualizarPerfilAdmin
}