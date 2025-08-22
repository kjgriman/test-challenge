# 📁 Configuración de .gitignore para el Proyecto

## 🎯 **Archivos .gitignore Creados**

### **1. `.gitignore` (Raíz del proyecto)**
- **Propósito**: Configuración general para todo el proyecto
- **Cubre**: Dependencias, variables de entorno, archivos de build, IDE, OS

### **2. `frontend/.gitignore`**
- **Propósito**: Específico para el frontend React/Vite
- **Cubre**: node_modules, .env, dist/, .vite/, TypeScript

### **3. `backend/.gitignore`**
- **Propósito**: Específico para el backend Node.js/Express
- **Cubre**: node_modules, .env, logs, archivos de base de datos

### **4. `.gitignore.local`**
- **Propósito**: Archivos específicos del proyecto de terapia del habla
- **Cubre**: Grabaciones, audio, configuraciones sensibles, backups

## 🔒 **Archivos Protegidos**

### **Variables de Entorno (.env)**
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### **Dependencias**
```
node_modules/
npm-debug.log*
yarn-debug.log*
```

### **Build Outputs**
```
dist/
build/
.vite/
```

### **Archivos del Sistema**
```
.DS_Store (macOS)
Thumbs.db (Windows)
.vscode/
.idea/
```

## 📝 **Archivos Específicos del Proyecto**

### **Grabaciones de Sesiones**
```
recordings/
sessions-recordings/
*.webm
*.mp4
*.avi
```

### **Archivos de Audio**
```
audio/
*.wav
*.mp3
*.ogg
```

### **Configuraciones Sensibles**
```
mongodb-config.json
atlas-config.json
*.env.production
```

## ⚠️ **Importante**

### **NO Subir al Repositorio:**
- ✅ Variables de entorno (.env)
- ✅ node_modules/
- ✅ Archivos de build (dist/, build/)
- ✅ Logs y archivos temporales
- ✅ Configuraciones de IDE
- ✅ Grabaciones de sesiones
- ✅ Archivos de audio

### **SÍ Subir al Repositorio:**
- ✅ Código fuente (.ts, .tsx, .js, .jsx)
- ✅ Archivos de configuración (.json, .config.js)
- ✅ Documentación (.md)
- ✅ Assets estáticos (imágenes, iconos)
- ✅ Archivos de ejemplo (.env.example)

## 🚀 **Comandos Útiles**

### **Verificar qué se va a subir:**
```bash
git status
git add .
git status
```

### **Verificar archivos ignorados:**
```bash
git check-ignore *
```

### **Limpiar archivos ya trackeados:**
```bash
git rm -r --cached node_modules/
git rm --cached .env
```

## 📋 **Checklist Antes de Commit**

- [ ] Verificar que `.env` no esté en el staging area
- [ ] Verificar que `node_modules/` no esté incluido
- [ ] Verificar que no hay archivos de build
- [ ] Verificar que no hay logs o archivos temporales
- [ ] Verificar que no hay configuraciones sensibles

## 🔧 **Configuración Adicional**

### **Para Desarrollo Local:**
```bash
# Crear archivo .env.example
cp .env .env.example
# Editar .env.example removiendo valores sensibles
```

### **Para Producción:**
```bash
# Asegurar que .env.production esté en .gitignore
echo ".env.production" >> .gitignore
```

---

**Nota**: Estos archivos `.gitignore` están configurados para proteger información sensible y evitar subir archivos innecesarios al repositorio. Revisa siempre antes de hacer commit.
