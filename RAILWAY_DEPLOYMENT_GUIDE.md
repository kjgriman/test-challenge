# 🚂 Guía de Despliegue del Backend en Railway

Esta guía te ayudará a desplegar el backend de tu plataforma de terapia del habla en Railway.

## 📋 Prerrequisitos

1. **Cuenta de Railway**: Regístrate en [railway.app](https://railway.app)
2. **Cuenta de MongoDB Atlas**: Para la base de datos en la nube
3. **GitHub**: Tu código debe estar en un repositorio de GitHub
4. **URL del Frontend**: La URL de tu frontend desplegado en Vercel

## 🔧 Preparación del Proyecto

### 1. Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita si no la tienes
3. Crea un nuevo cluster
4. Obtén tu string de conexión
5. Reemplaza `<username>`, `<password>` y `<cluster>` en la URL

### 2. Variables de Entorno Necesarias

Necesitarás configurar estas variables en Railway:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speech-therapy?retryWrites=true&w=majority
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=24h
NODE_ENV=production
FRONTEND_URL=https://tu-frontend-app.vercel.app
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret
```

## 🚀 Pasos para Desplegar en Railway

### Paso 1: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub
5. Selecciona tu repositorio `test-challenge`

### Paso 2: Configurar el Servicio

1. **Railway detectará automáticamente** que es un proyecto Node.js
2. **Configura el Root Directory**: `backend`
3. **Railway usará automáticamente**:
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Paso 3: Configurar Variables de Entorno

En el dashboard de Railway:

1. Ve a tu proyecto
2. Haz clic en el servicio del backend
3. Ve a la pestaña "Variables"
4. Agrega las siguientes variables:

#### Variables Obligatorias:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speech-therapy
JWT_SECRET=tu-clave-secreta-super-segura
NODE_ENV=production
FRONTEND_URL=https://tu-frontend-app.vercel.app
```

#### Variables Opcionales:
```
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Paso 4: Desplegar

1. Railway comenzará automáticamente el despliegue
2. Puedes ver los logs en tiempo real
3. Una vez completado, obtendrás una URL como: `https://tu-app.railway.app`

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. En la pestaña "Settings" de tu servicio
2. Ve a "Domains"
3. Agrega tu dominio personalizado

## 🔧 Configuración Adicional

### Para WebSockets

Railway soporta WebSockets nativamente, por lo que tu aplicación debería funcionar sin problemas adicionales.

### Para Base de Datos

- **Desarrollo**: MongoDB local o Atlas
- **Producción**: MongoDB Atlas (recomendado)

### Para Archivos Estáticos

Si necesitas subir archivos:
1. Usa un servicio como Cloudinary o AWS S3
2. Configura las variables de entorno correspondientes

## 🐛 Solución de Problemas

### Error de Build

```bash
# Verifica que el build funcione localmente
cd backend
npm run build
```

### Error de Conexión a MongoDB

1. Verifica que la URL de MongoDB sea correcta
2. Asegúrate de que tu IP esté en la whitelist de Atlas
3. Verifica que el usuario tenga permisos correctos

### Error de CORS

1. Verifica que `FRONTEND_URL` esté configurada correctamente
2. Asegúrate de que la URL no termine con `/`

### Error de WebSockets

1. Railway soporta WebSockets nativamente
2. Verifica que la configuración de CORS sea correcta

## 📊 Monitoreo

### Logs de Railway

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio
3. Ve a la pestaña "Deployments"
4. Revisa los logs para debugging

### Métricas

1. Railway proporciona métricas básicas
2. Para más detalles, considera usar Sentry o similar

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz cambios en tu código local
2. Haz commit y push a GitHub
3. Railway desplegará automáticamente

## 📝 Notas Importantes

- **WebSockets**: Railway soporta WebSockets persistentes
- **Base de Datos**: Usa MongoDB Atlas para producción
- **Variables de Entorno**: Nunca subas archivos `.env` al repositorio
- **Dominio**: Puedes usar el dominio gratuito de Railway o configurar uno personalizado

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs de Railway
2. Verifica las variables de entorno
3. Consulta la documentación de Railway
4. Revisa los issues en GitHub

---

¡Tu backend debería estar funcionando en Railway! 🎉
