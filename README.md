![image](https://github.com/user-attachments/assets/27888262-fa25-400d-a1be-78bf451c268f)

# Desarrollo de un Sistema Administrativo de Gestión de Rutas para el Transporte Escolar de la “Unidad Educativa Particular EMAÚS”.

Este sistema está enfocado exclusivamente en la gestión administrativa del transporte escolar, con el objetivo de mejorar el orden, la eficiencia operativa y la calidad del servicio prestado.

## Herramientas
- Express.js
- MongoDB (Compass y Atlas)
- Vercel (Despliegue)
- Cloudinary (Imágenes)
- Nodemailer (Correos)
- Thunder Client
- Git
- Librerías NPM

## Estructura y roles
- **Administrador**: 
  - Gestion completa de los conductores ya sean normales como reemplazo.
- **Conductor**:
  - Gestión de los estudiantes a los que prestarán servicio de transporte.
- **Ambos roles**:
  - Iniciar sesión.
  - Recuperar contraseña.
  - Cambio forzado de contraseña en el primeer inicio de sesión.
  - Gestión de su información.

## Lógica principal del sistema
- **Privilegios y roles**: Los roles se asignan y modifican dinámicamente. El admin puede ser solo admin o también conductor. Los privilegios se transfieren y eliminan según reglas de negocio.
- **Reemplazos**: Se gestionan reemplazos temporales y permanentes de conductores, con transferencia de estudiantes y rutas.
- **Estudiantes**: Los conductores pueden registrar, actualizar y eliminar estudiantes de su ruta.
- **Validaciones**: Todos los endpoints validan unicidad de datos (cédula, email, placa, teléfono), formato de campos y privilegios del usuario logeado.
- **Notificaciones**: Se envían correos en cambios de privilegios, registro, eliminación y actualización de datos relevantes.
- **Historial**: Se registra el historial de reemplazos, activaciones y cambios para reportes.

## Cómo clonar y ejecutar el proyecto

1. Clona el repositorio:
   ```bash
   git clone https://github.com/MireyaJO/PROYECTO_TESIS.git
   ```
2. Ingresa a la carpeta del proyecto:
   ```bash
   cd PROYECTO_TESIS
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Configura las variables de entorno necesarias (solicita el archivo `.env` al correo electronico: mireya.garcia@epn.edu.ec).
5. Ejecuta el servidor:
   ```bash
   npm start
   ```

## Autora
- Mireya Garcia
