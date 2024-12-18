import { check, validationResult } from 'express-validator'

//Validaciones para el conductor 
const validacionesConductor = [
     // Verificar que se encuentren los campos obligatorios y no estén vacíos
    check(["nombreConductor","apellidoConductor","telefonoConductor","numeroDeCedula","placaAutomovil","numeroDeRutaAsignada", "sectoresDeLaRuta", "institucion", 
        "emailDelConductor"
    ])
    .exists()
        .withMessage('Los campos "nombreConductor","apellidoConductor","telefonoConductor","numeroDeCedula","placaAutomovil","numeroDeRutaAsignada", "sectoresDeLaRuta", "institucion", "fotografiaDelConductor", "emailDelConductor" y/o "passwordParaElConductor" son obligatorios')
    .notEmpty()
        .withMessage('Los campos "nombreConductor","apellidoConductor","telefonoConductor","numeroDeCedula","placaAutomovil","numeroDeRutaAsignada", "sectoresDeLaRuta", "institucion", "fotografiaDelConductor", "emailDelConductor" y/o "passwordParaElConductor" no pueden estar vacíos')
    .customSanitizer(value => value?.trim()),

    //Verificación de que todo sea un string
    check(["nombreConductor","apellidoConductor","sectoresDeLaRuta"])
    .isString()
        .withMessage('El campo debe ser un texto, no se acepta otro tipo de dato')
    .customSanitizer(value => value?.trim()),

    // Verificar que el numero de telefono sea de 10 digitos
    check("telefonoConductor")
    .isLength({ min: 10, max: 10 })
        .withMessage('El teléfono debe ser de 10 digitos')
    .isNumeric()
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que el número de cédula tenga 10 dígitos
    check("numeroDeCedula")
    .isLength({ min: 3, max: 20 })
        .withMessage('La cedula debe ser de 10 digitos')
    .isNumeric()
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()), 
    
    // Verificar que el número de placa tenga 7 dígitos
    check("placaAutomovil")
    .isLength({ min: 7, max: 7 })
        .withMessage('La placa debe ser de 7 digitos')
    .isNumeric()
        .withMessage('El campo "teléfono" debe contener solo números')
    .customSanitizer(value => value?.trim()),

    // Verificar que la ruta sea un número
    check("numeroDeRutaAsignada")
    .isNumeric()
        .withMessage('La ruta debe ser un número, no se acepta otro tipo de dato')
    .customSanitizer(value => value?.trim()),

    // Verificar que el email se enceuntre bien escrito
    check("emailDelConductor")
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
    
    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            return res.status(400).send({ errors: errors.array() });
        }
     }
]

export {validacionesConductor}