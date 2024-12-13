import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

//Variables de entorno
dotenv.config();

//Configuración del transportador de nodemailer
let transportador = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }   
});

//El envió del correo al conductor
const enviarCorreoConductor = (email, password, ruta, sectores) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Credenciales de acceso a la aplicación para los conductores de la Unidad Educativa Particular Emaús",
        html: `<p>Usted es conductor de la Unidad Educativa Particular “Emaús”.<br>
        <strong>Ruta:</strong> ${ruta}<br>
        <strong>Sectores:</strong> ${sectores}<br>
        Por último, sus credenciales para ingresar a la aplicación son: ${email} y ${password}</p>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}; 

//El envío del correo al conductor para la actualización de la ruta y sectores
const actualizacionDeConductor = (email, password, ruta, sectores) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Actualización de la ruta y sectores de los conductores de la Unidad Educativa Particular Emaús",
        html: `<p>Usted es conductor de la Unidad Educativa Particular “Emaús”.<br>
        <strong>Ruta:</strong> ${ruta}<br>
        <strong>Sectores:</strong> ${sectores}<br>
        Por último, le recordamos sus credenciales siguen siendo las mismas</p>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}; 
//El envío de correo al conductor para notificarle su eliminación del sistema 
const eliminacionDelConductor = (email, nombres, apellidos) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Eliminación del conductor del Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombres} ${apellidos} ha sido eliminado del sistema, usted ya no tiene un ruta en la Unidad Educativa Particular Emaús </p>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}; 
export {
    enviarCorreoConductor, 
    actualizacionDeConductor,
    eliminacionDelConductor
}