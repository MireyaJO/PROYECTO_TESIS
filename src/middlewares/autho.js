import jwt from 'jsonwebtoken';

//Creación del token para el logeo de cada usuario
const createToken = (userInfo) => {
    //Se firma con la información del usuaro, la clave secreta y el tiempo de expiración
  return jwt.sign(userInfo, process.env.JWT_SECRET,{expiresIn:'1h'})
}

//Verificación del token para el acceso a las rutas privadas
const verificacionToken = (req, res, next) => {
    //Se obtiene de la cabezera de la petición el token
  const authHeader = req.headers.authorization
  //Si no se proporciona el token o si no comienza con la palabra "Bearer " se envía un mensaje de error
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({message: 'Token no proporcionado'})
  }
  //Si el token si existe, se obtiene el token de la cabezera y se verifica con la clave secreta, sino existe un error se envia el token decodificado
  const token = authHeader.split(' ')[1]
  jwt.verify(token,process.env.JWT_SECRET, (error, decoded)=>{
    if(error){
        return res.status(403).json({message:"Fallo al autenticar"})
    }
    req.user = decoded
    //Se pasa el control a la siguiente ruta si la utenticación es exitosa
    next()
})
}

// Middleware para verificar el rol de conductor
const verificacionConductorRol = (req, res, next) => {
  if (req.user.role !== 'conductor') {
      return res.status(403).json({ message: "Acceso denegado. Solo los conductores pueden acceder a esta ruta." });
  }
  next();
}

// Middleware para verificar el rol de admin
const verificacionAdminRol = (req, res, next) => {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Acceso denegado. Solo los administradores pueden acceder a esta ruta." });
  }
  next();
}

//Middleware para verificar el rol de representante
/*const verificacionRepresentanteRol = (req, res, next) => {
    if (req.user.role !== 'representante') {
        return res.status(403).json({ message: "Acceso denegado. Solo los representantes pueden acceder a esta ruta." });
    }
    next();
}*/

export {
  createToken, 
  verificacionToken, 
  verificacionConductorRol,
  verificacionAdminRol, 
  //verificacionRepresentanteRol
}