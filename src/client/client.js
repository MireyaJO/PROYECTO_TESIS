//Establecer conexión con el servidor de socket.io
const socket = io('http://localhost:3000');

// Función para iniciar sesión y guardar el JWT en localStorage
const loginRepresentante = async (email, password) => {
    try {
        const response = await fetch('  /api/login/representante', {
            //Se envia información al servidor
            method: 'POST',
            //En que formato se envía la informacion
            headers: {
                'Content-Type': 'application/json'
            },
            //Se coloca la contraseña y el email en formato JSON
            body: JSON.stringify({ email, password }) 
        });

        //La respuesta del servidor se le asigna a la variable data
        const data = await response.json();

        if (response.ok) {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            console.log('Inicio de sesión exitoso:', data.msg_login_representante);

            // Obtener el ID del representante y registrarlo con el servidor de socket.io
            obtenerRepresentanteId().then(representanteId => {
                if (representanteId) {
                    //Se registra en el servidor de socket.io el representante
                    socket.emit('registrarRepresentante', { representanteId });
                }
            });
        } else {
            console.error('Error al iniciar sesión:', data.msg_login_representante);
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
    }
};

// Función para obtener el ID del representante autenticado
const obtenerRepresentanteId = async () => {
    try {
        const response = await fetch('/api/obtenerRepresentanteId', {
            //Obtener información del servidor
            method: 'GET',
            //Encabezado de autorización que contiene el token (formato Bearer)
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }
        });
        if (!response.ok) {
            //Si existe un error se traslada directamente al bloque catch y se muestra un mensaje de error
            throw new Error('Error al obtener el ID del representante');
        }
        //Espera la respuesta del servidor y la convierte en formato JSON, la asigana a la variable data
        const data = await response.json();
        //Retorna el ID del representante
        return data.id;
    } catch (error) {
        console.error(error);
        //Devuelve null si hay un error
        return null;
    }
};

// Solicitar permiso para mostrar notificaciones
//Si el permiso no ha sido concedido, se solicita al usuario que lo conceda 
if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

// Manejar la recepción de notificaciones
socket.on('notificacion', (data) => {
    //Mostrar notificación si el permiso ha sido concedido
    if (Notification.permission === 'granted') {
        new Notification('Notificación de llegada del bus escolar', {
            body: data.msg_envio_notificacion
        });
    } else {
        console.log('Permiso de notificación no concedido');
    }
});