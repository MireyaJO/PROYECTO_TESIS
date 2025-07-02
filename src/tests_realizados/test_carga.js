import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// Imágenes
const imageNormal = http.file(open('imagenes/conductor_normal.jpg', 'b'), 'foto_normal.jpg', 'image/jpeg');
const imageReemplazo = http.file(open('imagenes/conductor_reemplazo.jpg', 'b'), 'foto_reemplazo.jpg', 'image/jpeg');
const imageAdmin = http.file(open('imagenes/administrador.jpg', 'b'), 'foto_admin.jpg', 'image/jpeg');

const BASE_URL = 'https://proyecto-tesis-1.onrender.com/api/';

export let options = {
  scenarios: {
    admin: {
      executor: 'constant-vus',
      exec: 'adminFlow',
      vus: 1,
      duration: '1m',
    },
    conductor: {
      executor: 'constant-vus',
      exec: 'conductorFlow',
      vus: 13,
      duration: '1m',
    },
  },
};

// =======================
// FLUJO ADMINISTRADOR
// =======================
export function adminFlow() {
  let loginAdministrador = http.post(`${BASE_URL}login`, JSON.stringify({
    email: 'miregarcia205@gmail.com',
    password: 'administrador1',
    role: 'admin'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginAdministrador, {
    'login admin status 200': (r) => r.status === 200,
    'token admin exists': (r) => r.json('token') !== undefined,
  });

  if (loginAdministrador.status === 200) {
    const token = loginAdministrador.json('token');
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

    const actualizacionConductorFijo = {
      nombre: `NombreNuevo${random}`,
      apellido: `ApellidoNuevo${random}`,
      cooperativa: `CoopNuevo${random}`,
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`,
      rutaAsignada: `${Math.floor(Math.random() * 12) + 1}`,
      sectoresRuta: `SectorNuevo${random}`,
    };

    const id1 = '6854df1c36e4a1a33dbcc123';
    const id2 = '68585170bb24d15e7924b473';
    const id3 = '685aa9e39c49844d86af9aaf';
    const idsConductoresFijos = [id1, id2, id3];
    const idConductorFijo = idsConductoresFijos[Math.floor(Math.random() * idsConductoresFijos.length)];

    const actualizacionInfoAdmin = {
      nombre: `AdminNuevo${random}`,
      apellido: `ApellidoAdminNuevo${random}`,
      telefono: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      cooperativa: `CoopAdminNuevo${random}`,
      placaAutomovil: `ABC-${Math.floor(1000 + Math.random() * 8999)}`,
      fotografiaDelConductor: imageAdmin,
      email: 'miregarcia205@gmail.com',
    };

    const idReemplazo = '68585170bb24d15e7924b473';
    const idAntiguo = '685aa9e39c49844d86af9aaf';
    const rutas = [1, 11, 12];
    const rutaABuscar = rutas[Math.floor(Math.random() * rutas.length)];
    const informacionHaVisualizar = ['Reemplazo temporal', 'Reemplazo permanente', 'Activación de conductores originales', 'Reemplazo Activos', 'Listado de estudiantes de un conductor'];
    const informacionAbuscar = informacionHaVisualizar[Math.floor(Math.random() * informacionHaVisualizar.length)];
    let infoReporte = { informacionHaVisualizar: informacionHaVisualizar };
    if (informacionAbuscar === 'Listado de estudiantes de un conductor') {
      infoReporte.rutaABuscar = rutaABuscar;
    }
    const idReemplazoAEliminar = '686206af295a4dca3a4e82be';
    const idReemplazoPermanente = '686377e442fdd5196d3e5ea1';
    const idEliminado = '686240403ca2e8ae47cfebc5';

    // Aquí van todas las peticiones y checks del admin (igual que en tu script rutas_admin_test.js)
    // ... (puedes copiar y pegar el bloque de tu flujo admin aquí, igual que en tu archivo actual) ...

    // Ejemplo de una petición:
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

    let reemplazoPermanente = http.patch(`${BASE_URL}reemplazo/permanente/${idEliminado}/${idReemplazoPermanente}`, null,{
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

    sleep(1);
  }
}

// =======================
// FLUJO CONDUCTOR
// =======================
export function conductorFlow() {
  let loginConductor = http.post(`${BASE_URL}login`, JSON.stringify({
    email: 'ejemplotesis02@hotmail.com',
    password: 'kari111***',
    role: 'conductor'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginConductor, {
    'login conductor status 200': (r) => r.status === 200,
    'token conductor exists': (r) => r.json('token') !== undefined,
  });

  if (loginConductor.status === 200) {
    let token = loginConductor.json('token');
    const genero = ['Femenino', 'Masculino', 'Prefiero no decirlo'];
    const generoAleatorio = genero[Math.floor(Math.random() * genero.length)];
    const nivelEscolar = ['Nocional', 'Inicial 1', 'Inicial 2', 'Primero de básica', 'Segundo de básica', 'Tercero de básica', 'Cuarto de básica', 'Quinto de básica',
      'Sexto de básica', 'Séptimo de básica', 'Octavo de básica', 'Noveno de básica', 'Décimo de básica', 'Primero de bachillerato', 'Segundo de bachillerato', 'Tercero de bachillerato'];
    const nivelEscolarAleatorio = nivelEscolar[Math.floor(Math.random() * nivelEscolar.length)];
    const paralelo = ['A', 'B', 'C'];
    const paraleloAleatorio = paralelo[Math.floor(Math.random() * paralelo.length)];
    const turno = ['Mañana', 'Tarde', 'Completo'];
    const turnoAleatorio = turno[Math.floor(Math.random() * turno.length)];

    // Cuerpo de la solicitud para registro de estudiante
    let cuerpoEstudiante = {
      nombre: `Estudiante ${randomString(5)}`,
      apellido: `Apellido ${randomString(5)}`,
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      genero: generoAleatorio,
      nivelEscolar: nivelEscolarAleatorio,
      paralelo: paraleloAleatorio,
      ubicacionDomicilio: 'https://maps.app.goo.gl/u6SXhLEJsdeERzA88',
      turno: turnoAleatorio
    };

    // Registrar estudiante
    let registroEstudiante = http.post(`${BASE_URL}registro/estudiantes`, JSON.stringify(cuerpoEstudiante), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    check(registroEstudiante, {
      'registro de estudiantes status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_registro_estudiantes') !== undefined))
    });

    // Obtener el id del estudiante recién registrado
    let idEstudiante = registroEstudiante.json('nuevoEstudiante')?._id || registroEstudiante.json('_id');

    // Eliminar ese mismo estudiante si se registró correctamente
    if (idEstudiante) {
      let eliminarEstudiante = http.del(`${BASE_URL}eliminar/estudiante/${idEstudiante}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      check(eliminarEstudiante, {
        'eliminación de estudiante status 200': (r) => r.status === 200 || r.status === 400,
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_eliminacion_estudiante') !== undefined))
      });
    }

    //Visualizar todos los estudiantes
    let visualizarEstudiantes = http.get(`${BASE_URL}lista/estudiantes`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(visualizarEstudiantes, {
        'visualización de estudiantes status 200': (r) => r.status === 200 || r.status === 400, 
        'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_lista_estudiantes') !== undefined))
    });

    //Buscar estudiante por cédula
    //Array de cédulas de estudiantes para buscar
    let cedulasEstudiantes = ['1823146799', '1834256700', '1723167899'];
    //Selección de cédula aleatoria de estudiantes
    let cedulaAleatoria = cedulasEstudiantes[Math.floor(Math.random() * cedulasEstudiantes.length)];

    let buscarEstudianteCedula = http.get(`${BASE_URL}buscar/estudiante/cedula/${cedulaAleatoria}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }   
    });

    check(buscarEstudianteCedula, {
      'búsqueda de estudiante por cédula status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_buscar_estudiante') !== undefined))
    });

    //Array de ids de estudiantes para actualizar
    let idsEstudiantes = [ '686388ec03e0e7affe78c206', '686388f803e0e7affe78c20c', '6863890103e0e7affe78c212'];
    //Selección de ids aleatorios de estudiantes
    let idsAleatorios = idsEstudiantes[Math.floor(Math.random() * idsEstudiantes.length)];

    //Actaualización del estudiante
    let actualizacionEstudiante = {
        nivelEscolar: nivelEscolarAleatorio,
        paralelo: paraleloAleatorio,
        ubicacionDomicilio: 'https://maps.app.goo.gl/E1PXvk8JTdnfpfXM9',
        turno: turnoAleatorio
    }

    let actualizarEstudiante = http.patch(`${BASE_URL}actualizar/estudiante/${idsAleatorios}`, JSON.stringify(actualizacionEstudiante), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    }});

    check(actualizarEstudiante, {
      'actualización de estudiante status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_actualizar_estudiantes') !== undefined))
    });

    //Visualizar perfil del conductor
    let visualizarPerfilConductor = http.get(`${BASE_URL}perfil/conductor`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    check(visualizarPerfilConductor, {
      'visualización de perfil status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_visualizar_perfil') !== undefined))
    });

    //Actualizar perfil del conductor
    let cuerpoDelConductor ={
        telefono: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
        fotografiaDelConductor: imageNormal,
        email: 'ejemplotesis02@hotmail.com'
    }

    let actualizarPerfilConductor = http.patch(`${BASE_URL}actualizar/perfil/conductor`, cuerpoDelConductor, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });

    check(actualizarPerfilConductor, {
      'actualización de perfil status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_actualizacion_perfil') !== undefined))
    });

    sleep(1);
  }
}