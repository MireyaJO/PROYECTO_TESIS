import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const imageNormal = http.file(open('imagenes/conductor_normal.jpg', 'b'), 'foto_normal.jpg', 'image/jpeg');

export let opciones ={
    // Número de usuarios virtuales
    vus: 13,
    // Duración de la prueba (el usuario hace sin numeros de iteraciones hasta que el tiempo culmine)
    duration: '1m', 
}

const BASE_URL = 'https://proyecto-tesis-1.onrender.com/api/';

export default function () {
  //Login de administrador
  let loginConductor = http.post(`${BASE_URL}login`, JSON.stringify({
    email: 'ejemplotesis02@hotmail.com' ,
    password: 'kari111***',
    role: 'conductor'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginConductor, {
    'login status 200': (r) => r.status === 200,
    'token exists': (r) => r.json('token') !== undefined,
  });

  // Si el login fue exitoso, usa el token para otras rutas protegidas
  if (loginConductor.status === 200) {
    let token = loginConductor.json('token');

    //Valores para cursos, paralelo y turno para que no existan conflictos
    //Array de valores esperados en genero
    const genero = ['Femenino', 'Masculino', 'Prefiero no decirlo'];
    //Selección de alguno de los 2 ids aleatoriamente
    const generoAleatorio = genero[Math.floor(Math.random() * genero.length)];

    //Array de valores esperados en nivel escolar
    const nivelEscolar = ['Nocional', 'Inicial 1', 'Inicial 2', 'Primero de básica', 'Segundo de básica', 'Tercero de básica', 'Cuarto de básica', 'Quinto de básica', 
        'Sexto de básica', 'Séptimo de básica', 'Octavo de básica', 'Noveno de básica', 'Décimo de básica', 'Primero de bachillerato', 'Segundo de bachillerato', 'Tercero de bachillerato'];
    //Selección de alguno de los valores aleatoriamente
    const nivelEscolarAleatorio = nivelEscolar[Math.floor(Math.random() * nivelEscolar.length)];

    //Array de valores esperados en paralelo
    const paralelo = ['A', 'B', 'C'];
    //Selección de alguno de los valores aleatoriamente
    const paraleloAleatorio = paralelo[Math.floor(Math.random() * paralelo.length)];

    //Datos aleatorios para la ubicacion del domicilio
    // Coordenadas aproximadas de Quito
    const latitud = (Math.random() * (0.15) + -0.25 + -0.1807).toFixed(6); // -0.25 a -0.10 aprox
    const longitud = (Math.random() * (0.15) + -78.6).toFixed(6);           // -78.6 a -78.45 aprox
    //Construcción de la ubicación aleatoria
    const ubicacionAleatoria = `https://www.google.com/maps?q=${latitud},${longitud}`;

    //Array con los valores que se espera en el turno
    const turno = ['Mañana', 'Tarde', 'Completo'];
    //Selección de alguno de los valores aleatoriamente
    const turnoAleatorio = turno[Math.floor(Math.random() * turno.length)];
        
    // Cuerpo de la solicitud para registro de estudiante
    let cuerpoEstudiante = {
      nombre: `Estudiante ${randomString(5)}`,
      apellido: `Apellido ${randomString(5)}`,
      cedula: `${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      genero: generoAleatorio,
      nivelEscolar: nivelEscolarAleatorio,
      paralelo: paraleloAleatorio,
      ubicacionDomicilio: ubicacionAleatoria,
      turno: turnoAleatorio
    };

    // Solicitud de registro de estudiante
    let registroEstudiante = http.post(`${BASE_URL}registro/estudiantes`, JSON.stringify(cuerpoEstudiante), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Chequeo de la respuesta
    check(registroEstudiante, {
      'registro de estudiantes status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_registro_estudiantes') !== undefined))
    });

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
    let cedulasEstudiantes = ['1724356788', '1724356790', '1756478933'];
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
    let idsEstudiantes = [ '686369ccdbc90ce936ca0891', '686369f0dbc90ce936ca0897', '68636a11dbc90ce936ca089d'];
    //Selección de ids aleatorios de estudiantes
    let idsAleatorios = idsEstudiantes[Math.floor(Math.random() * idsEstudiantes.length)];

    //Actaualización del estudiante
    let actualizacionEstudiante = {
        nivelEscolar: nivelEscolarAleatorio,
        paralelo: paraleloAleatorio,
        ubicacionDomicilio: ubicacionAleatoria,
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

    //Array de ids de estudiantes para eliminar
    let idsEstudiantesEliminar = ['68636c9adbc90ce936ca08a3', '68636cbbdbc90ce936ca08a9', '68636cffdbc90ce936ca08af'];
    //Selección de ids aleatorios de estudiantes
    idsAleatorios = idsEstudiantesEliminar[Math.floor(Math.random() * idsEstudiantesEliminar.length)];

    //Eliminacion de estudiante
    let eliminarEstudiante = http.del(`${BASE_URL}eliminar/estudiante/${idsAleatorios}`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    }   
    });

    check(eliminarEstudiante, {
      'eliminación de estudiante status 200': (r) => r.status === 200 || r.status === 400,
      'mensaje esperado': (r) => r.status === 200 || (r.status === 400 && (r.json('msg_eliminacion_estudiante') !== undefined))
    });

    sleep(1); // Espera un segundo entre peticiones
  }
}