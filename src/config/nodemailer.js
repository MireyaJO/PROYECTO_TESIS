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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) Conductor,</p>
                <p>Usted ha sido asignado como conductor en nuestra institución. A continuación, encontrará los detalles de su ruta y sus credenciales para acceder a la aplicación:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ruta:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${ruta}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sectores:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${sectores}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contraseña:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Por favor, asegúrese de cambiar su contraseña después de iniciar sesión por primera vez.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
    }; 

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
        html: 
        `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) Conductor,</p>
                <p>Usted es conductor de la Unidad Educativa Particular “Emaús”. A continuación, encontrará los detalles actualizados de su ruta y sectores:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ruta:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${ruta}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sectores:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${sectores}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Por último, le recordamos que sus credenciales no se han modificado, siguen siendo las mismas.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
    };
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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombres} ${apellidos},</p>
                <p>Lamentamos informarle que ha sido eliminado del sistema de la Unidad Educativa Particular “Emaús”. A partir de ahora, usted ya no tiene una ruta asignada en nuestra institución.</p>
                <p>Si tiene alguna pregunta o necesita más información, por favor, póngase en contacto con nosotros.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
    };
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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombres} ${apellidos},</p>
                <p>Usted ha solicitado recuperar su contraseña. Para ello, por favor haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}comprobar/token/${token}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                </p>
                <p>Si no solicitó este cambio, por favor ignore este correo.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombre} ${apellido},</p>
                <p>Usted ha sido registrado en el sistema de la Unidad Educativa Particular Emaús. Para confirmar su correo electrónico, haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}confirmar/correoRepresentante/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
                </p>
                <p>Si no solicitó este cambio, por favor ignore este correo.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
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
        html:  `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
            <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Usted ha solicitado recuperar su contraseña. Para ello, por favor haga clic en el siguiente enlace:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.URL_BACKEND}comprobar/token/${token}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            </p>
            <p>Si no solicitó este cambio, por favor ignore este correo.</p>
            <p>Atentamente,</p>
            <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
        </div>
    `
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
        html:  `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
            <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Usted ha solicitado cambiar su correo electrónico. Para confirmar el cambio, haga clic en el siguiente enlace:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
            </p>
            <p>Si no solicitó este cambio, por favor ignore este correo.</p>
            <p>Atentamente,</p>
            <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
        </div>
    `
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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombre} ${apellido},</p>
                <p>Usted ha solicitado cambiar su correo electrónico. Para confirmar el cambio, haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
                </p>
                <p>Si no solicitó este cambio, por favor ignore este correo.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
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
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombresRepresentante} ${apellidosRepresentante},</p>
                <p>Lamentamos informarle que el estudiante ${nombresEstudiante} ${apellidosEstudiante}, del cual usted es representante, ha sido eliminado del sistema de transporte escolar de la Unidad Educativa Particular Emaús. Como resultado, usted ya no tiene representados vinculados y ha sido eliminado del sistema.</p>
                <p>Si tiene alguna pregunta o necesita más información, por favor, póngase en contacto con nosotros.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
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

const informacionEliminacion = async (email, nombresRepresentante, apellidosRepresentante, ruta, nombresConductor, apellidosConductor)=>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Eliminación del conductor del sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombresRepresentante} ${apellidosRepresentante},</p>
                <p>Le informamos que el conductor de la ruta ${ruta} de sus representados, ${nombresConductor} ${apellidosConductor}, ha sido eliminado del sistema.</p>
                <p>Por favor, esté pendiente a su correo, se le notificará el nuevo conductor asignado.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `    
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

const cambioConductor = async (email, nombresRepresentante, apellidosRepresentante, ruta, nombresNuevoConductor, apellidosNuevoConductor) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Cambio del conductor del sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
                <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombresRepresentante} ${apellidosRepresentante},</p>
                <p>Le informamos que el nuevo conductor de la ruta ${ruta} de sus representados es: ${nombresNuevoConductor} ${apellidosNuevoConductor}.</p>
                <p>Por favor, póngase en contacto con el nuevo conductor para coordinar los detalles del transporte.</p>
                <p>Atentamente,</p>
                <p><strong>Un dirigente de la Cooperativa de Transporte Escolar y Turismo Ciudad de Quito</strong></p>
            </div>
        `
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
    informacionEliminacion, 
    cambioConductor
}