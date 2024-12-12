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
        html: `<p>Usted es conductor de la Unidad Educativa Particular “Emaús”, su ruta es ${ruta}, esta complementa 
        los siguientes sectores ${sectores}. Por último, sus credenciales para ingresar a la aplicación son: ${email} y ${password}</p>`
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
export default enviarCorreoConductor