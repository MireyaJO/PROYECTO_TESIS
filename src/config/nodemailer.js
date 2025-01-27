import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

//Variables de entorno
dotenv.config();

//Configuración del transportador de nodemailer
let transportador = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
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
        Por último, sus credenciales para ingresar a la aplicación son:<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Contraseña:</strong> ${password}<br>
        <strong><i>Atentamente: </i></strong> Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</p>`
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
const actualizacionDeConductor = (email, ruta, sectores) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Actualización de la ruta y sectores de los conductores de la Unidad Educativa Particular Emaús",
        html: `<p>Usted es conductor de la Unidad Educativa Particular “Emaús”.<br>
        <strong>Ruta:</strong> ${ruta}<br>
        <strong>Sectores:</strong> ${sectores}<br>
        Por último, le recordamos que sus credenciales no se han modificado, siguen siendo las mismas </p>`
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

const recuperacionContrasenia = (email, nombres, apellidos, token) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Recuperación de contraseña del conductor del Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombres} ${apellidos} usted desea recuperar su contraseña, para aquello ingrese al siguiente link: </p>
        <hr>
        <a href=${process.env.URL_BACKEND}comprobar/token/${token}>Clic aquí para reestablecer tu contraseña</a>
        <hr>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const confirmacionDeCorreoRepresentante = async (email, nombre, apellido, token) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Confirmación de correo electrónico",
        html: `<p>Señor/a ${nombre} ${apellido} usted ha sido registrado en el sistema de la Unidad Educativa Particular Emaús, para confirmar su correo electrónico haga clic en el siguiente link: </p>
        <hr>
        <a href=${process.env.URL_BACKEND}confirmar/correoRepresentante/${encodeURIComponent(token)}>Clic aquí para confirmar tu correo electrónico</a>
        <hr>`
    };

    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const recuperacionContraseniaRepresentante = async (email, nombre, apellido, token) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Recuperación de contraseña del representante de la Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombre} ${apellido} usted desea recuperar su contraseña, para aquello ingrese al siguiente link: </p>
        <hr>
        <a href=${process.env.URL_BACKEND}comprobar/token/${token}>Clic aquí para reestablecer tu contraseña</a>
        <hr>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const confirmacionDeCorreoRepresentanteCambio = async (email, nombre, apellido, token) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Confirmación del nuevo correo electrónico para el representante de un estudiante de la Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombre} ${apellido} usted desea cambiar su correo electronico, para confirmar el mismo haga clic en el siguiente link: </p>
        <hr>
        <a href=${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}>Clic aquí para confirmar tu correo electrónico</a>
        <hr>`
    };

    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const confirmacionDeCorreoConductorCambio = async (email, nombre, apellido, token) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Confirmación del nuevo correo electrónico para el conductor de un estudiante de la Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombre} ${apellido} usted desea cambiar su correo electronico, para confirmar el mismo haga clic en el siguiente link: </p>
        <hr>
        <a href=${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}>Clic aquí para confirmar tu correo electrónico</a>
        <hr>`
    };

    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const eliminacionDelRepresentante = async (email, nombresRepresentante, apellidosRepresentante, nombresEstudiante, apellidosEstudiante) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Eliminación del sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombresRepresentante} ${apellidosRepresentante} el estudiante ${nombresEstudiante} ${apellidosEstudiante} del cual es representante ha sido eliminado. Usted 
        ya no tuvo representados vinculados, por lo que, se lo/a elimino</p>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

const informacionEliminacion = async (email, nombresRepresentante, apellidosRepresentante, ruta, nombresConductor, apellidosConductor)=>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Eliminación del conductor del sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html: `<p>Señor/a ${nombresRepresentante} ${apellidosRepresentante} el conductor de la ruta de sus representados, ${ruta}, ${nombresConductor} ${apellidosConductor}
        ha sido eliminado del sistema. Por favor debe estar pendiente a su correo, se le notificará el nuevo conductor</p>`
    }
    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if(error){
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

export {
    enviarCorreoConductor, 
    actualizacionDeConductor,
    recuperacionContrasenia,
    eliminacionDelConductor, 
    confirmacionDeCorreoRepresentante, 
    recuperacionContraseniaRepresentante, 
    confirmacionDeCorreoRepresentanteCambio, 
    confirmacionDeCorreoConductorCambio,
    eliminacionDelRepresentante, 
    informacionEliminacion
}