const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function createTestUser() {
  try {
    console.log('🔄 Creando usuario test@test.com...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const userData = {
      email: 'test@test.com',
      password: 'test123',
      firstName: 'Usuario',
      lastName: 'Prueba',
      role: 'slp',
      licenseNumber: 'TEST123456',
      specialization: ['language'],
      yearsOfExperience: 5
    };
    
    const response = await makeRequest(options, userData);
    const result = response.data;
    
    if (result.success) {
      console.log('✅ Usuario test@test.com creado exitosamente');
      console.log(`   Email: test@test.com`);
      console.log(`   Contraseña: test123`);
      console.log(`   Nombre: ${result.data.user.firstName} ${result.data.user.lastName}`);
      console.log(`   Rol: ${result.data.user.role}`);
    } else {
      console.log('⚠️  Usuario ya existe o error:', result.error?.message);
      
      // Intentar login para verificar si ya existe
      console.log('🔍 Verificando si el usuario ya existe...');
      const loginOptions = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      const loginData = {
        email: 'test@test.com',
        password: 'test123'
      };
      
      const loginResponse = await makeRequest(loginOptions, loginData);
      const loginResult = loginResponse.data;
      if (loginResult.success) {
        console.log('✅ Usuario test@test.com ya existe y la contraseña es correcta');
        console.log(`   Email: test@test.com`);
        console.log(`   Contraseña: test123`);
        console.log(`   Nombre: ${loginResult.data.user.firstName} ${loginResult.data.user.lastName}`);
        console.log(`   Rol: ${loginResult.data.user.role}`);
      } else {
        console.log('❌ Error en login:', loginResult.error?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();
