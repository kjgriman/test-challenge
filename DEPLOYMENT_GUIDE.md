# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu plataforma de terapia del habla en Vercel paso a paso.

## 📋 Prerrequisitos

1. **Cuenta de Vercel**: Regístrate en [vercel.com](https://vercel.com)
2. **Cuenta de MongoDB Atlas**: Para la base de datos en la nube
3. **GitHub**: Tu código debe estar en un repositorio de GitHub
4. **Node.js**: Versión 18 o superior

## 🔧 Preparación del Proyecto

### 1. Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster
4. Obtén tu string de conexión
5. Reemplaza `<username>`, `<password>` y `<cluster>` en la URL

### 2. Variables de Entorno

Necesitarás configurar estas variables en Vercel:

#### Variables del Backend:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speech-therapy?retryWrites=true&w=majority
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=24h
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret
```

#### Variables del Frontend:
```
VITE_API_URL=https://test-challenge-production.up.railway.app
VITE_APP_NAME=Plataforma de Terapia del Habla
VITE_SOCKET_URL=https://test-challenge-production.up.railway.app
```

## 🚀 Pasos para Desplegar

### Paso 1: Subir el Código a GitHub

```bash
# Si no tienes un repositorio Git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Selecciona el repositorio de tu proyecto

### Paso 3: Configurar el Proyecto en Vercel

#### Configuración del Build:

**Root Directory**: Deja vacío (usar la raíz del proyecto)

**Build Command**: 
```bash
npm run build
```

**Output Directory**: 
```
frontend/dist
```

**Install Command**:
```bash
npm run install:all
```

### Paso 4: Configurar Variables de Entorno

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Haz clic en "Settings"
3. Ve a "Environment Variables"
4. Agrega todas las variables listadas arriba

### Paso 5: Configurar Dominios

1. En "Settings" > "Domains"
2. Agrega tu dominio personalizado (opcional)
3. O usa el dominio automático de Vercel

### Paso 6: Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine el proceso
3. Tu aplicación estará disponible en la URL proporcionada

## 🔧 Configuración Adicional

### Para WebSockets (Socket.io)

Vercel tiene limitaciones con WebSockets. Para solucionarlo:

1. **Opción 1**: Usar Vercel Edge Functions
2. **Opción 2**: Usar un servicio externo como Pusher
3. **Opción 3**: Usar Railway o Render para el backend

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
# Verifica que todas las dependencias estén instaladas
npm run install:all

# Verifica que el build funcione localmente
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

1. Vercel tiene limitaciones con WebSockets persistentes
2. Considera usar un servicio alternativo para el backend

## 📊 Monitoreo

### Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en "Functions"
3. Revisa los logs para debugging

### Métricas

1. Vercel proporciona métricas básicas
2. Para más detalles, considera usar Sentry o similar

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz cambios en tu código local
2. Haz commit y push a GitHub
3. Vercel desplegará automáticamente

## 📝 Notas Importantes

- **WebSockets**: Vercel tiene limitaciones con conexiones persistentes
- **Base de Datos**: Usa MongoDB Atlas para producción
- **Variables de Entorno**: Nunca subas archivos `.env` al repositorio
- **Dominio**: Puedes usar el dominio gratuito de Vercel o configurar uno personalizado

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Consulta la documentación de Vercel
4. Revisa los issues en GitHub

---

¡Tu aplicación debería estar funcionando en Vercel! 🎉
