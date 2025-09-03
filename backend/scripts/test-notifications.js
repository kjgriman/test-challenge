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

async function testNotifications() {
  try {
    console.log('🧪 Iniciando prueba de notificaciones...');
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

    console.log('📊 Respuesta de login:', {
      statusCode: loginResponse.statusCode,
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.data?.token
    });

    if (!loginResponse.data.success || !loginResponse.data.data?.token) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

    // 2. Obtener notificaciones
    console.log('\n📋 2. Obteniendo notificaciones...');
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
      totalNotifications: notificationsResponse.data.data?.notifications?.length || 0
    });

    if (!notificationsResponse.data.success) {
      console.log('❌ Error obteniendo notificaciones:', notificationsResponse.data);
      return;
    }

    const notifications = notificationsResponse.data.data.notifications || [];
    console.log('📋 Notificaciones encontradas:', notifications.length);

    // Mostrar detalles de cada notificación
    notifications.forEach((notification, index) => {
      console.log(`\n📋 Notificación ${index + 1}:`);
      console.log(`   ID: ${notification._id}`);
      console.log(`   Título: ${notification.title}`);
      console.log(`   Tipo: ${notification.type}`);
      console.log(`   Prioridad: ${notification.priority}`);
      console.log(`   Leída: ${notification.read}`);
      console.log(`   Fecha: ${notification.createdAt}`);
    });

    // 3. Obtener estadísticas
    console.log('\n📊 3. Obteniendo estadísticas...');
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
      stats: statsResponse.data.data
    });

    // 4. Marcar una notificación como leída
    if (notifications.length > 0) {
      const firstNotification = notifications[0];
      console.log(`\n✅ 4. Marcando notificación como leída: ${firstNotification._id}`);
      
      const markReadResponse = await makeRequest(`${BACKEND_URL}/api/notifications/${firstNotification._id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Respuesta de marcar como leída:', {
        statusCode: markReadResponse.statusCode,
        success: markReadResponse.data.success
      });

      if (markReadResponse.data.success) {
        console.log('✅ Notificación marcada como leída exitosamente');
      } else {
        console.log('❌ Error marcando como leída:', markReadResponse.data);
      }
    }

    // 5. Marcar todas como leídas
    console.log('\n✅ 5. Marcando todas las notificaciones como leídas...');
    const markAllReadResponse = await makeRequest(`${BACKEND_URL}/api/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Respuesta de marcar todas como leídas:', {
      statusCode: markAllReadResponse.statusCode,
      success: markAllReadResponse.data.success,
      updatedCount: markAllReadResponse.data.data?.updatedCount
    });

    if (markAllReadResponse.data.success) {
      console.log('✅ Todas las notificaciones marcadas como leídas exitosamente');
    } else {
      console.log('❌ Error marcando todas como leídas:', markAllReadResponse.data);
    }

    console.log('\n🎉 Prueba de notificaciones completada exitosamente');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testNotifications();
