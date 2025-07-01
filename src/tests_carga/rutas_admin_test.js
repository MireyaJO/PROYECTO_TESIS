import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

//Variables globales
const imageNormal = http.file(open('imagenes/conductor_normal.jpg', 'b'), 'foto_normal.jpg', 'image/jpeg');
const imageReemplazo = http.file(open('imagenes/conductor_reemplazo.jpg', 'b'), 'foto_reemplazo.jpg', 'image/jpeg');
const imageAdmin = http.file(open('imagenes/administrador.jpg', 'b'), 'foto_admin.jpg', 'image/jpeg');


export let opciones ={
    // Número de usuarios virtuales
    vus: 1,
    // Duración de la prueba (el usuario hace sin numeros de iteraciones hasta que el tiempo culmine)
    duration: '1m', 
}

const BASE_URL = 'https://proyecto-tesis-1.onrender.com/api/';

export default function () {
  //Login de administrador
  let loginAdministrador = http.post(`${BASE_URL}login`, JSON.stringify({
    email: 'miregarcia205@gmail.com' ,
    password: 'administrador1',
    role: 'admin'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginAdministrador, {
    'login status 200': (r) => r.status === 200,
    'token exists': (r) => r.json('token') !== undefined,
  });

  // Si el login fue exitoso, usa el token para otras rutas protegidas
  if (loginAdministrador.status === 200) {
    const token = loginAdministrador.json('token');

    // Registrar conductor (con datos aleatorios)
    let random = randomString(6);
    let conductorNormal = {
        nombre: `Test${random}`,
        apellido: `Apellido${random}`,
        cooperativa: `Coop${random}`,
        rutaAsignada: `${Math.floor(Math.random() * 12) + 1}`,
        sectoresRuta: `Sector${random}`,
        generoConductor: 'Masculino',
        telefono: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
        placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`,
        cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
        email: `test${random}@mail.com`,
        esReemplazo: 'No',
        fotografiaDelConductor: imageNormal
    };

    // Registrar conductor reemplazo (con datos aleatorios)
    let conductorReemplazo = {
        nombre: `Test${random}`,
        apellido: `Apellido${random}`,
        cooperativa: `Coop${random}`,
        generoConductor: 'Masculino',
        telefono: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
        placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`,
        cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
        email: `test${random}@mail.com`,
        esReemplazo: 'Sí',
        fotografiaDelConductor: imageReemplazo
    };

    //Actualización de datos del conductor fijo 
    const actualizacionConductorFijo ={
      nombre: `NombreNuevo${random}`, 
      apellido: `ApellidoNuevo${random}`,  
      cooperativa: `CoopNuevo${random}`, 
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`, 
      placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`, 
      rutaAsignada: `${Math.floor(Math.random() * 12) + 1}`, 
      sectoresRuta: `SectorNuevo${random}`,
    }
    //IDS de conductores fijos 
    const id1 = '6854df1c36e4a1a33dbcc123'; 
    const id2 = '68585170bb24d15e7924b473';
    const id3 = '685aa9e39c49844d86af9aaf';
    //Array de IDs de conductores fijos
    const idsConductoresFijos = [id1, id2, id3];
    //Selección de alguno de los 2 ids aleatoriamente
    const idConductorFijo = idsConductoresFijos[Math.floor(Math.random() * idsConductoresFijos.length)];

    //Actualización del admin logeado
    const actualizacionInfoAdmin = {
      nombre: `AdminNuevo${random}`,
      apellido: `ApellidoAdminNuevo${random}`, 
      telefono: `09${Math.floor(10000000 + Math.random() * 89999999)}`,  
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`, 
      cooperativa: `CoopAdminNuevo${random}`, 
      placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`, 
      fotografiaDelConductor: imageAdmin,
      email: 'miregarcia205@gmail.com', 
    }
    
    //Ids para reemplazo temporal y activación del conductor antiguo
    const idReemplazo = '68585170bb24d15e7924b473';
    const idAntiguo = '685aa9e39c49844d86af9aaf';

    //Rutas a buscar 
    const rutas = [1,11,12];
    //Selección de alguno de los 2 ids aleatoriamente
    const rutaABuscar = rutas[Math.floor(Math.random() * rutas.length)];

    //Información a consultar en los reportes
    const informacionHaVisualizar = ['Reemplazo temporal', 'Reemplazo permanente', 'Activación de conductores originales', 'Reemplazo Activos', 'Listado de estudiantes de un conductor']; 
    const informacionAbuscar = informacionHaVisualizar[Math.floor(Math.random() * informacionHaVisualizar.length)];

    //Informacion para los reportes 
    let infoReporte = {
      informacionHaVisualizar: informacionHaVisualizar
    };

    if (informacionAbuscar === 'Listado de estudiantes de un conductor') {
      infoReporte.rutaABuscar = rutaABuscar;
    }

    //Reemplazo ha eliminar 
    const idReemplazoAEliminar = '686206af295a4dca3a4e82be';

    //Reemplazo permanente
    const idReemplazoPermanente = '686209b57f0819edd6f718f0';
    const idEliminado = '6854df1c36e4a1a33dbcc123';

    //Se utiliza el token obtenido en el login para autenticar las solicitudes 
    let registrarConductorFijo = http.post(`${BASE_URL}registro/conductores`, JSON.stringify(conductorNormal), {
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
    });

    check(registrarConductorFijo, {
        'registro conductor status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_registro_conductor') !== undefined))
    });

    let listaDeConductores = http.get(`${BASE_URL}listar/conductores`,{
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(listaDeConductores, {
        'listado de conductores': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) =>
        Array.isArray(r.json()) ||
        r.json('msg_listar_conductores') !== undefined
    });

    let buscarConductorPorRuta = http.get(`${BASE_URL}buscar/conductor/ruta/${rutaABuscar}`,{
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(buscarConductorPorRuta, {
        'buscar conductor por ruta status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) =>
        Array.isArray(r.json()) ||
        r.json('msg_buscar_conductor_ruta') !== undefined
    });

    let registrarConductorReemplazo = http.post(`${BASE_URL}registro/conductores`, JSON.stringify(conductorReemplazo), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(registrarConductorReemplazo, {
        'registro conductor status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_registro_conductor') !== undefined))
    });

    let listarReemplazoDisponibles = http.get(`${BASE_URL}listar/reemplazo/disponibles`,{
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(listarReemplazoDisponibles, {
        'listado de reemplazos disponibles': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) =>
            Array.isArray(r.json()) ||
            r.json('msg_listar_conductores_reemplazo') !== undefined
    });

    let listarConductoresConReemplazo = http.get(`${BASE_URL}/listar/conductores/conreemplazo`,{
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(listarConductoresConReemplazo, {
        'listado de conductores con reemplazo': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) =>
            Array.isArray(r.json()) ||
            r.json('msg') !== undefined
    });

    let buscarConductoresConReemplazo = http.get(`${BASE_URL}buscar/conductor/conreemplazo/ruta/${rutaABuscar}`,{
        headers: {  
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'    
        }
    });

    check(buscarConductoresConReemplazo, {
        'buscar conductores con reemplazo por ruta status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) =>
        Array.isArray(r.json()) ||
        r.json('msg_buscar_conductor_reemplazo') !== undefined
    });

    let actualizarConductorFijo = http.patch(`${BASE_URL}actualizar/conductor/${idConductorFijo}`, JSON.stringify(actualizacionConductorFijo), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(actualizarConductorFijo, {
        'actualización conductor status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 &&
        (r.json('msg_actualizacion_conductor') !== undefined || r.json('msg_registro_conductor') !== undefined))
    });

    let actualizarAdmin = http.patch(`${BASE_URL}actualizar/informacion/admin`, JSON.stringify(actualizacionInfoAdmin), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(actualizarAdmin, {
        'actualización admin status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 &&
        (r.json('msg_actualizacion_perfil') !== undefined || r.json('msg_registro_conductor') !== undefined))
    });

    let reemplazoTemporal = http.patch(`${BASE_URL}reemplazo/temporal/${idAntiguo}/${idReemplazo}`,null,{
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });  

    check(reemplazoTemporal, {
        'reemplazo temporal status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 &&
            (r.json('msg_reemplazo') !== undefined || r.json('msg_actualizacion_conductor') !== undefined))
    });

    let activarConductorAntiguo = http.patch(`${BASE_URL}activar/conductor/original/${idAntiguo}`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(activarConductorAntiguo, {
        'activación conductor antiguo status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => (r.status === 200 && r.json('msg_reemplazo') !== undefined) || (r.status === 400 && r.json('msg_activacion_conductor') !== undefined)
    });

    let visualizarAdmin = http.get(`${BASE_URL}visualizar/perfil/admin`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'  
        }
    });

    check(visualizarAdmin, {
        'visualizar admin status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_admin') !== undefined))
    });

    let reportes = http.post(`${BASE_URL}info/completa/reemplazos`, JSON.stringify(infoReporte), {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }); 

    check(reportes, {
        'reportes status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_historial_reemplazo') !== undefined))
    });

    let cantidades = http.get(`${BASE_URL}info/cantidades`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(cantidades, {
        'cantidades status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_historial_reemplazo') !== undefined))
    });

    let eliminarReemplazo = http.del(`${BASE_URL}eliminar/reemplazos/disponible/${idReemplazoAEliminar}`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(eliminarReemplazo, {
        'eliminar reemplazo status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_eliminar_reemplazo') !== undefined))
    });

    let reemplazoPermanente = http.patch(`${BASE_URL}reemplazo/permanente/${idReemplazoAEliminar}/${idReemplazoPermanente}/${idEliminado}`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'  
        }
    });

    check(reemplazoPermanente, {
        'reemplazo permanente status 200 or 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_reemplazo') !== undefined))
    });

    let aumentarPrivilegios = http.patch(`${BASE_URL}aumentar/privilegios/conductor`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(aumentarPrivilegios, {
        'aumentar privilegios status 200 o 400': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado':(r) =>(r.json('msg_añadir_privilegios') !== undefined) || (r.json('msg_ceder_privilegios') !== undefined)
    });

  }

  sleep(1); // Espera 1 segundo entre iteraciones
}