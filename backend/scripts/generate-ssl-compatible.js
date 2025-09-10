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

// Generar certificado auto-firmado más compatible
try {
  console.log('🔐 Generando certificado SSL compatible...');
  
  // Generar clave privada RSA de 2048 bits
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Crear archivo de configuración para el certificado
  const configContent = `
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = IT Department
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;
  
  const configPath = path.join(certDir, 'cert.conf');
  fs.writeFileSync(configPath, configContent);
  
  // Generar certificado con SAN (Subject Alternative Names)
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}" -extensions v3_req`, { stdio: 'inherit' });
  
  // Limpiar archivo de configuración
  fs.unlinkSync(configPath);
  
  console.log('✅ Certificados SSL compatibles generados exitosamente');
  console.log(`📁 Certificado: ${certPath}`);
  console.log(`📁 Clave: ${keyPath}`);
  
} catch (error) {
  console.error('❌ Error generando certificados SSL:', error.message);
  console.log('💡 Asegúrate de tener OpenSSL instalado');
  process.exit(1);
}
