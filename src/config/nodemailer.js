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

// Correos para el admin
const enviarCorreoConductor = (emailCoordinador, email, password, ruta, sectores, nombreConductor, apellidoConductor, coordinadorApellido, coordinadorNombre) =>{
    let cambiosReemplazo = "";

    if (ruta === undefined || sectores === undefined) {
        cambiosReemplazo= ` 
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contraseña:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
                    </tr>
                </table>
                <p>Usted es reemplazo así que su ruta y sectores variarán según sea el caso.</p>
        `; 
    } else {
        cambiosReemplazo = `
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
        `;
    }; 

    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Credenciales de acceso para el sistema de los transportistas escolares de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular "Emaús"</h2>
                <p>Estimado(a) ${nombreConductor} ${apellidoConductor},</p>
                <p>Usted ha sido registrado como conductor en nuestra institución. A continuación, encontrará los detalles de su ruta y sus credenciales para acceder a la aplicación:</p>
                ${cambiosReemplazo}
                <p style="margin-top: 20px;">Por favor, asegúrese de cambiar su contraseña después de iniciar sesión por primera vez.</p>
                <p><b>Atentamente,</b></p>
                <p> ${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong><b>Coordinador de rutas</b></strong></p>
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

//Correos enviados en el registro de conductores con privilegios de admin 
const nuevoAdministrador = async (emailCoordinador, email, trabajaOno, nombreConductor, apellidoConductor, passwordConductor, rutaConductor, sectoresConductor, apellidoAntiguoAdmin, nombreAntiguoAdmin) => {
    let noSeTrabajaComoConductor = "";
    if(trabajaOno === "Sí"){
        noSeTrabajaComoConductor = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ruta:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${rutaConductor}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Sectores:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${sectoresConductor}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contraseña:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${passwordConductor}</td>
                </tr>
            </table>
        `; 
    } else if(trabajaOno === "No"){
        noSeTrabajaComoConductor = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Contraseña:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${passwordConductor}</td>
                </tr>
            </table>
        `;
    }
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Credenciales de acceso a la aplicación para el nuevo Coordinador de rutas de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús</h2>
                <p>Estimado(a) ${nombreConductor} ${apellidoConductor},</p>
                <p>Usted ha sido registrado como conductor administrador de los transportistas de la Unidad Educativa Particular “Emaús. A continuación, encontrará los detalles acceder al sistema:</p>
                ${noSeTrabajaComoConductor}
                <p style="margin-top: 20px;">Por favor, asegúrese de cambiar su contraseña después de iniciar sesión por primera vez.</p>
                <p>Atentamente,</p>
                <p>${nombreAntiguoAdmin} ${apellidoAntiguoAdmin}</p>
                <p><strong>Ex coordinador de Rutas</strong></p>
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

const cambioAdmin = async (emailCoordinador, nombreConductorNuevo, apellidoConductorNuevo, email, nombreConductor, apellidoConductor, coordinadorAntiguoApellido, coordinadorAntiguoNombre)=>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Nuevo Coordinador de Rutas en la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;"> Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombreConductor} ${apellidoConductor}</p>
                <p>Se informa que existe un nuevo coordinador de rutas en nuestra institución. El nuevo coordinador es: ${nombreConductorNuevo} ${apellidoConductorNuevo}.</p>
                <p>Por favor, póngase en contacto con el nuevo coordinador para cualquier consulta o coordinación relacionada con su ruta.</p>
                <p><b>Atentamente,</b></p>
                <p>${coordinadorAntiguoApellido} ${coordinadorAntiguoNombre}</p>
                <p><strong><b>Coordinador de rutas saliente</b></strong></p>
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
const actualizacionDeConductor = (emailCoordinador, email, apellidoConductor, nombreConductor, ruta, sectores, coordinadorApellido, coordinadorNombre) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Actualización de la ruta y sectores de los conductores de la Unidad Educativa Particular Emaús",
        html: 
        `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular "Emaús"</h2>
                <p>Estimado(a) ${nombreConductor} ${apellidoConductor},</p>
                <p>Se ha realizado un cambio en la ruta y los sectores que cubrirá. A continuación, encontrará los detalles actualizados de su ruta y sectores:</p>
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
                <p><b>Atentamente,</b></p>
                <p> ${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong><b>Coordinador de rutas</b></strong></p>
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

const confirmacionDeCorreoConductorCambio = async (emailCoordinador, email, nombre, apellido, token) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Confirmación del nuevo correo electrónico para el conductor de un estudiante de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombre} ${apellido},</p>
                <p>Usted ha solicitado cambiar su correo electrónico. Para confirmar el cambio, haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
                </p>
                <p>Si no solicitó este cambio, por favor ignore este correo.</p>
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

const asignacionAdministrador = async (emailCoordinador, email, nombre, apellido, ruta, sectores, nombreAntiguoAdmin, apellidoAntiguoAdmin) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Nuevo Administrador del Sistema de Transporte Escolar de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <img src="https://scontent.fuio1-1.fna.fbcdn.net/v/t39.30808-6/473806187_1029754585625597_5323957965040517382_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHdf2hdnAOn_cNYBimK26NO1FjI_Lx8asvUWMj8vHxqyxGKOybUXalYc7GYNujV6Qx9AN_rUinZtd5i9Tb46lwk&_nc_ohc=k4KKr-EI_LEQ7kNvgE9dhsd&_nc_oc=AdgyXYkNQug99SfKXoV5kZHKsqOp9aTJ2MzfS3DtmfdacCYjaENXC2dI2_fYEGci_tnP2_l78yBGrPoCMuH3AEC_&_nc_zt=23&_nc_ht=scontent.fuio1-1.fna&_nc_gid=ABmP3IHMt6AcGyi7pFR2N9p&oh=00_AYDwX3J4AgKHALGfnuoFFQ2j93kr84QCLlOszjwMEJpvGw&oe=67A9D73C" alt="Logo" style="width: 100%; max-width: 600px; border-radius: 10px;">
            <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Nos complace informarle que ha sido designado como nuevo administrador del sistema de transporte escolar de la Unidad Educativa Particular Emaús.</p>
            <p>Usted mantendrá la misma ruta y sectores asignados, así como sus credenciales de acceso. A continuación, encontrará los detalles:</p>
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
            </table>
            <p style="margin-top: 20px;">Su contraseña no ha cambiado. Si desea cambiar su contraseña, por favor utilice la opción de restablecimiento de contraseña en el sistema.</p>
            <p><b>Atentamente,</b></p>
            <p> ${apellidoAntiguoAdmin} ${nombreAntiguoAdmin}</p>
            <p><strong><b>Coordinador de rutas</b></strong></p>
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

const conductorDesactivado = async (emailCoordinador, email, nombreConductorNormal, apellidoConductorNormal, nombreReemplazo, apellidoReemplazo, ruta, sectores, coordinadorNombre, coordinadorApellido) => {
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Ha comenzado su periodo de inactividad en el sistema de transportistas escolares de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombreConductorNormal} ${apellidoConductorNormal},</p>
            <p>Le informamos que su tiempo de servicio como conductor de la ruta <strong>${ruta}</strong> ha sido temporalmente suspendido. El conductor <strong>${nombreReemplazo} ${apellidoReemplazo}</strong> ha sido asignado como su reemplazo.</p>
            <p>El reemplazo cubrirá los siguientes sectores: <strong>${sectores}</strong>.</p>
            <p>Por favor, comuníquese con el coordinador de rutas para coordinar su regreso cuando sea necesario.</p>
            <p>Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con el coordinador.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorApellido} ${coordinadorNombre}</p>
            <p><strong>Coordinador de Rutas</strong></p>
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

const designacionDeReemplazo = async (emailCoordinador, email, nombreReemplazo, apellidoReemplazo, ruta, sectores, nombreConductorReemplazado, apellidoConductorReemplazado, tipoDeReemplazo, coordinadorNombre, coordinadorApellido) => {
    let datoPorTipoDeReemplazo = "";

    if (tipoDeReemplazo === 'Temporal') {
        datoPorTipoDeReemplazo = ` <p><strong>En la aplicacion móvil SOLO PUEDE AGREGAR ESTUDIANTES Y TOMAR ASISTENCIA</strong></p>`; 
    } else if (tipoDeReemplazo === 'Permanente') {
        datoPorTipoDeReemplazo = `<p><strong>En la aplicación móvil tiene la posibilidad de GESTIONAR POR COMPLETO A LOS ESTUDIANTES</strong></p>`;
    }; 

    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Designación de reemplazo en el sistema de transportistas escolares de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombreReemplazo} ${apellidoReemplazo},</p>
            <p>Le informamos que ha sido asignado como conductor de reemplazo para la ruta <strong>${ruta}</strong>.</p>
            <p>Detalles de la asignación:</p>
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
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Conductor ha reemplazar:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${nombreConductorReemplazado} ${apellidoConductorReemplazado}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tipo de reemplazo:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${tipoDeReemplazo}</td>
                </tr>
            </table>
            <p>Por favor, asegúrese de coordinar con los representantes de los estudiantes asignados para garantizar un servicio eficiente.</p>
            <p>Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con el coordinador de rutas.</p>
            ${datoPorTipoDeReemplazo}
            <p><b>Atentamente,</b></p>
            <p>${coordinadorNombre} ${coordinadorApellido}</p>
            <p><strong>Coordinador de Rutas</strong></p>
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

const eliminacionDelConductor = (emailCoordinador, email, nombresEliminado, apellidosEliminado, coordinadorApellido, coordinadorNombre) =>{
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Eliminación del conductor en el sistema de transportistas escolares de la Unidad Educativa Particular Emaúss",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombresEliminado} ${apellidosEliminado},</p>
                <p>Lamentamos informarle que ha sido eliminado del sistema de transportistas de la Unidad Educativa Particular “Emaús”. A partir de ahora, usted ya no tiene una ruta asignada en nuestra institución.</p>
                <p>Si tiene alguna pregunta o necesita más información, por favor, póngase en contacto con el coordinador de las rutas.</p>
                <p><b>Atentamente,</b></p>
                <p> ${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong><b>Coordinador de rutas</b></strong></p>
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

const conductorReactivado = async (emailCoordinador, nombre, apellido, ruta, sectores, coordinadorNombre, coordinadorApellido) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reactivación como Conductor en el sistema de transportistas escolares de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular "Emaús"</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Nos complace informarle que ha sido reactivado como conductor de la ruta <strong>${ruta}</strong>, cubriendo los sectores: <strong>${sectores}</strong>.</p>
            <p>Usted ahora está nuevamente a cargo de los estudiantes asignados a esta ruta.</p>
            <p>Por favor, comuníquese con el coordinador de rutas si tiene alguna pregunta o necesita más información.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorApellido} ${coordinadorNombre}</p>
            <p><strong>Coordinador de Rutas</strong></p>
        </div>
        `
    };

    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

const conductorDesocupado = async (emailCoordinador, email, nombre, apellido, ruta, sectores, coordinadorNombre, coordinadorApellido) => {
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Finalización de Reemplazo en el sistema de transportistas escolares de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular "Emaús"</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Le informamos que su período como conductor de reemplazo para la ruta <strong>${ruta}</strong>, cubriendo los sectores: <strong>${sectores}</strong>, ha finalizado.</p>
            <p>El conductor original ha sido reactivado y ahora está nuevamente a cargo de esta ruta.</p>
            <p>Por favor, comuníquese con el coordinador de rutas si tiene alguna pregunta o necesita más información.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorApellido} ${coordinadorNombre}</p>
            <p><strong>Coordinador de Rutas</strong></p>
        </div>
        `
    };

    //Creación del transportador universal con el email y el password del conductor ingresado por el administrador
    transportador.sendMail(estructuraEmail, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
};

const recuperacionContrasenia = (emailCoordinador, email, nombres, apellidos, token, coordinadorApellido, coordinadorNombre) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: `"${emailCoordinador} (Administrador)" <${process.env.EMAIL_USER}>`,
        to: email,  
        subject: "Recuperación de contraseña de un transportista escolar de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombres} ${apellidos},</p>
                <p>Usted ha solicitado recuperar su contraseña. Para ello, por favor haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}comprobar/token/${token}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
                </p>
                <p>Si no solicitó este cambio, por favor ignore este correo.</p>
                <p><b>Atentamente,</b></p>
                <p>${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong>Coordinador de Rutas</strong></p>
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
}; 

/*const cambioConductor = async (email, nombresRepresentante, apellidosRepresentante, ruta, nombresNuevoConductor, apellidosNuevoConductor, nombresConductorAnterior, apellidosConductorAnterior, telefonoConductorAnterior, coordinadorApellido, coordinadorNombre, tipoDeReemplazo) => {
    let datoPorTipoDeReemplazo = "";
    
    if (tipoDeReemplazo === 'Temporal') {
        datoPorTipoDeReemplazo = `
        <p>Este cambio es temporal. Cuando el conductor original, <strong>${nombresConductorAnterior} ${apellidosConductorAnterior}</strong>, regrese a sus funciones, se le notificará con anticipación.</p>
        <p><b>Contacto del nuevo conductor asignado: </b> <strong>${telefonoConductorAnterior}</strong>. Cabe recalcar que la información del conductor también se encuentra en la aplicación móvil.</p>
        `;
    } else if (tipoDeReemplazo === 'Permanente') {
        datoPorTipoDeReemplazo = `
        <p>Este cambio es permanente. El conductor original, <strong>${nombresConductorAnterior} ${apellidosConductorAnterior}</strong>, ya no estará a cargo de la ruta <strong>${ruta}</strong>.</p>
        <p><b>Contacto del nuevo conductor asignado: </b> <strong>${telefonoConductorAnterior}</strong>. Cabe recalcar que la información del conductor también se encuentra en la aplicación móvil.</p>
        `;
    }

    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Cambio de Conductor de la Unidad Educativa Particular Emaús",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombresRepresentante} ${apellidosRepresentante},</p>
            <p>Le informamos que el conductor de la ruta <strong>${ruta}</strong> de sus representados ha sido cambiado. El nuevo conductor asignado es <strong>${nombresNuevoConductor} ${apellidosNuevoConductor}</strong>.</p>
            <p>Este cambio será de tipo: <strong>${tipoDeReemplazo}</strong>.</p>
            ${datoPorTipoDeReemplazo}
            <p>Por favor, no dude en ponerse en contacto con el nuevo conductor para coordinar los detalles del transporte.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorNombre} ${coordinadorApellido}</p>
            <p><strong>Coordinador de Rutas</strong></p>
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

const recuperacionContraseniaRepresentante = async (email, nombre, apellido, token, coordinadorApellido, coordinadorNombre) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Recuperación de contraseña del representante de un estudiante registrado en el sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html:  `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Usted ha solicitado recuperar su contraseña. Para ello, por favor haga clic en el siguiente enlace:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.URL_BACKEND}comprobar/token/${token}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
            </p>
            <p>Si no solicitó este cambio, por favor ignore este correo.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorApellido} ${coordinadorNombre}</p>
            <p><strong>Coordinador de Rutas</strong></p>
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

const confirmacionDeCorreoRepresentanteCambio = async (email, nombre, apellido, token, coordinadorApellido, coordinadorNombre) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Confirmación del nuevo correo electrónico para el representante de un estudiante registrado en el sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html:  `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
            <p>Estimado(a) ${nombre} ${apellido},</p>
            <p>Usted ha solicitado cambiar su correo electrónico. Para confirmar el cambio, haga clic en el siguiente enlace:</p>
            <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.URL_BACKEND}cambio/email/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
            </p>
            <p>Si no solicitó este cambio, por favor ignore este correo.</p>
            <p><b>Atentamente,</b></p>
            <p>${coordinadorApellido} ${coordinadorNombre}</p>
            <p><strong>Coordinador de Rutas</strong></p>
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

const eliminacionDelRepresentante = async (email, nombresRepresentante, apellidosRepresentante, nombresEstudiante, apellidosEstudiante, coordinadorApellido, coordinadorNombre) => {
    //Creación de la estuctura que tendrá el correo 
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Eliminación del representante de un estudiante registrado en el sistema de transporte escolar de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombresRepresentante} ${apellidosRepresentante},</p>
                <p>Lamentamos informarle que el estudiante ${nombresEstudiante} ${apellidosEstudiante}, del cual usted es representante, ha sido eliminado del sistema de transporte escolar de la Unidad Educativa Particular Emaús. Como resultado, usted ya no tiene representados vinculados y ha sido eliminado del sistema.</p>
                <p>Si tiene alguna pregunta o necesita más información, por favor, póngase en contacto con nosotros.</p>
                <p><b>Atentamente,</b></p>
                <p>${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong>Coordinador de Rutas</strong></p>
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

/*const confirmacionDeCorreoRepresentante = async (email, nombre, apellido, token, coordinadorApellido, coordinadorNombre) => {
    //Creación de la estuctura que tendrá el correo
    let estructuraEmail = {
        from: process.env.EMAIL_USER,
        to: email,  
        subject: "Confirmación de correo electrónico del representante de estudiantes registrados en el sistema de transporte de la Unidad Educativa Particular Emaús",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #e0f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #00796b;">Transportistas de la Unidad Educativa Particular “Emaús”</h2>
                <p>Estimado(a) ${nombre} ${apellido},</p>
                <p>Usted ha sido registrado en el sistema de la Unidad Educativa Particular Emaús. Para confirmar su correo electrónico, haga clic en el siguiente enlace:</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.URL_BACKEND}confirmar/correoRepresentante/${encodeURIComponent(token)}" style="background-color: #00796b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo Electrónico</a>
                </p>
                <p><b>Atentamente,</b></p>
                <p>${coordinadorApellido} ${coordinadorNombre}</p>
                <p><strong>Coordinador de Rutas</strong></p>
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
};*/

export {
    enviarCorreoConductor,
    nuevoAdministrador, 
    actualizacionDeConductor,
    recuperacionContrasenia,
    eliminacionDelConductor,  
    confirmacionDeCorreoConductorCambio,
    cambioAdmin,
    asignacionAdministrador, 
    conductorDesactivado, 
    designacionDeReemplazo, 
    conductorReactivado, 
    conductorDesocupado,
    /*cambioConductor,
    confirmacionDeCorreoRepresentante, 
    recuperacionContraseniaRepresentante, 
    confirmacionDeCorreoRepresentanteCambio,
    eliminacionDelRepresentante*/
}