const https = require('https');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

// Función para hacer requests HTTP
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testNotificationsAPI() {
  try {
    console.log('🧪 Iniciando prueba de API de notificaciones...');
    console.log('🔗 Backend URL:', BACKEND_URL);

    // 1. Login para obtener token
    console.log('\n📝 1. Iniciando sesión...');
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'test@test.com',
      password: 'password123'
    });

    if (!loginResponse.data.success || !loginResponse.data.data?.token) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

    // 2. Probar endpoint de notificaciones
    console.log('\n📋 2. Probando endpoint de notificaciones...');
    const notificationsResponse = await makeRequest(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Respuesta de notificaciones:', {
      statusCode: notificationsResponse.statusCode,
      success: notificationsResponse.data.success,
      data: notificationsResponse.data.data
    });

    if (notificationsResponse.data.success) {
      const notifications = notificationsResponse.data.data.notifications || [];
      console.log(`📈 Total de notificaciones: ${notifications.length}`);
      
      if (notifications.length > 0) {
        console.log('📋 Primera notificación:');
        console.log(`   ID: ${notifications[0]._id}`);
        console.log(`   Título: ${notifications[0].title}`);
        console.log(`   Mensaje: ${notifications[0].message}`);
        console.log(`   Tipo: ${notifications[0].type}`);
        console.log(`   Leída: ${notifications[0].read}`);
        console.log(`   Fecha: ${notifications[0].createdAt}`);
      }
    }

    // 3. Probar endpoint de estadísticas
    console.log('\n📊 3. Probando endpoint de estadísticas...');
    const statsResponse = await makeRequest(`${BACKEND_URL}/api/notifications/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Respuesta de estadísticas:', {
      statusCode: statsResponse.statusCode,
      success: statsResponse.data.success,
      data: statsResponse.data.data
    });

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('📈 Estadísticas:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   No leídas: ${stats.unread}`);
      console.log(`   Alta prioridad: ${stats.highPriority}`);
      console.log(`   Hoy: ${stats.today}`);
    }

    // 4. Verificar que el token es válido
    console.log('\n🔐 4. Verificando token...');
    console.log('Token completo:', token);
    console.log('Longitud del token:', token.length);

    // 5. Probar con diferentes headers
    console.log('\n🔧 5. Probando con diferentes headers...');
    const testResponse = await makeRequest(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 Respuesta con headers adicionales:', {
      statusCode: testResponse.statusCode,
      success: testResponse.data.success,
      headers: testResponse.headers
    });

    console.log('\n🎉 Prueba de API de notificaciones completada exitosamente');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testNotificationsAPI();
