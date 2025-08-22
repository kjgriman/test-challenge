# 🚀 Guía para Subir Código a GitHub

## 🔑 **Configuración de Autenticación**

### **Opción 1: Token Personal (Recomendado)**

1. **Crear Token Personal en GitHub:**
   - Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click en "Generate new token (classic)"
   - Selecciona los scopes: `repo`, `workflow`
   - Copia el token generado

2. **Usar el Token:**
   ```bash
   # Cuando hagas push, usa tu username y el token como password
   git push -u origin master
   # Username: kjgriman
   # Password: [tu-token-personal]
   ```

### **Opción 2: Configurar SSH**

1. **Generar clave SSH:**
   ```bash
   ssh-keygen -t ed25519 -C "tu-email@example.com"
   ```

2. **Agregar clave a SSH agent:**
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. **Copiar clave pública:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. **Agregar a GitHub:**
   - Ve a [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
   - Click en "New SSH key"
   - Pega la clave pública

## 📋 **Comandos para Subir Código**

### **Verificar Estado Actual:**
```bash
git status
git remote -v
```

### **Agregar Archivos (si hay nuevos):**
```bash
git add .
git status
```

### **Hacer Commit (si hay cambios):**
```bash
git commit -m "feat: implementar plataforma de terapia del habla

- Sistema de autenticación completo
- Dashboard funcional con estadísticas
- CRUD completo de sesiones y estudiantes
- Sistema de videoconferencias con WebRTC
- WebSockets para tiempo real
- Configuración de .gitignore completa"
```

### **Subir al Repositorio:**
```bash
# Para HTTPS con token:
git push -u origin master

# Para SSH:
git push -u origin master
```

## 🎯 **Estructura del Proyecto**

```
test-challenge/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + TypeScript
├── .gitignore         # Configuración Git
├── README.md          # Documentación principal
├── AI_CONTEXT.md      # Contexto para IA
└── package.json       # Scripts del proyecto
```

## ⚠️ **Archivos Importantes**

### **✅ Subidos al Repositorio:**
- Código fuente completo
- Archivos de configuración
- Documentación
- Archivos de ejemplo (.env.example)

### **❌ NO Subidos:**
- node_modules/
- Archivos .env
- Logs y archivos temporales
- Archivos de build

## 🔧 **Solución de Problemas**

### **Error 403 - Permission Denied:**
- Verificar que el token tiene permisos de `repo`
- Usar el token correcto como password

### **Error SSH - Permission Denied:**
- Verificar que la clave SSH está agregada a GitHub
- Verificar que el SSH agent está ejecutándose

### **Error de Autenticación:**
```bash
# Configurar credenciales globalmente
git config --global user.name "kjgriman"
git config --global user.email "tu-email@example.com"
```

## 📝 **Próximos Pasos**

1. **Configurar autenticación** (token o SSH)
2. **Hacer push del código**
3. **Verificar en GitHub** que todo se subió correctamente
4. **Configurar GitHub Pages** (opcional para demo)
5. **Crear Issues** para próximas funcionalidades

---

**Nota**: Una vez configurada la autenticación, podrás hacer push sin problemas.
