const https = require('https');
const http = require('http');

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testSessionsEndpoint() {
  try {
    console.log('🧪 Probando endpoint de sesiones...');
    
    // Primero necesitamos hacer login para obtener un token
    const loginResponse = await makeRequest('http://127.0.0.1:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'password123'
      })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const loginData = JSON.parse(loginResponse.data);
    const token = loginData.data.token;
    
    console.log('✅ Login exitoso, token obtenido');
    console.log('👤 Usuario:', loginData.data.user.email, 'Rol:', loginData.data.user.role);

    // Ahora probar el endpoint de sesiones
    const sessionsResponse = await makeRequest('http://127.0.0.1:3001/api/sessions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status de respuesta:', sessionsResponse.status);
    console.log('📄 Respuesta completa:', sessionsResponse.data);

    if (sessionsResponse.status !== 200) {
      console.log('❌ Error obteniendo sesiones');
      return;
    }

    const sessionsData = JSON.parse(sessionsResponse.data);
    console.log('✅ Sesiones obtenidas exitosamente');
    console.log('📊 Total sesiones:', sessionsData.data.pagination.total);
    console.log('👥 Sesiones:');
    sessionsData.data.sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. Sesión ID: ${session._id}`);
      console.log(`      Estado: ${session.status}`);
      console.log(`      Fecha: ${session.scheduledDate}`);
      console.log(`      Duración: ${session.duration} min`);
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testSessionsEndpoint();
