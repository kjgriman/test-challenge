const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', 'ssl');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Crear directorio SSL si no existe
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Generar certificado auto-firmado
try {
  console.log('🔐 Generando certificado SSL auto-firmado...');
  
  // Generar clave privada
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Generar certificado
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ Certificados SSL generados exitosamente');
  console.log(`📁 Certificado: ${certPath}`);
  console.log(`📁 Clave: ${keyPath}`);
  
} catch (error) {
  console.error('❌ Error generando certificados SSL:', error.message);
  console.log('💡 Asegúrate de tener OpenSSL instalado');
  process.exit(1);
}
