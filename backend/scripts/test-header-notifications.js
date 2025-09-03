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

async function testHeaderNotifications() {
  try {
    console.log('🧪 Iniciando prueba de notificaciones del header...');
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

    // 2. Obtener notificaciones actuales
    console.log('\n📋 2. Obteniendo notificaciones actuales...');
    const notificationsResponse = await makeRequest(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!notificationsResponse.data.success) {
      console.log('❌ Error obteniendo notificaciones:', notificationsResponse.data);
      return;
    }

    const notifications = notificationsResponse.data.data.notifications || [];
    console.log(`📊 Total de notificaciones: ${notifications.length}`);

    // 3. Obtener estadísticas
    console.log('\n📊 3. Obteniendo estadísticas...');
    const statsResponse = await makeRequest(`${BACKEND_URL}/api/notifications/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('📈 Estadísticas:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   No leídas: ${stats.unread}`);
      console.log(`   Alta prioridad: ${stats.highPriority}`);
      console.log(`   Hoy: ${stats.today}`);
    }

    // 4. Encontrar una notificación no leída para probar
    const unreadNotification = notifications.find(n => !n.read);
    if (unreadNotification) {
      console.log(`\n🔔 4. Probando marcar como leída: ${unreadNotification.title}`);
      
      const markAsReadResponse = await makeRequest(`${BACKEND_URL}/api/notifications/${unreadNotification._id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Respuesta marcar como leída:', {
        statusCode: markAsReadResponse.statusCode,
        success: markAsReadResponse.data.success
      });

      if (markAsReadResponse.data.success) {
        console.log('✅ Notificación marcada como leída exitosamente');
      }
    } else {
      console.log('\n⚠️ No hay notificaciones no leídas para probar');
    }

    // 5. Probar eliminar una notificación
    if (notifications.length > 0) {
      const notificationToDelete = notifications[0];
      console.log(`\n🗑️ 5. Probando eliminar notificación: ${notificationToDelete.title}`);
      
      const deleteResponse = await makeRequest(`${BACKEND_URL}/api/notifications/${notificationToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Respuesta eliminar:', {
        statusCode: deleteResponse.statusCode,
        success: deleteResponse.data.success
      });

      if (deleteResponse.data.success) {
        console.log('✅ Notificación eliminada exitosamente');
      }
    }

    // 6. Verificar estadísticas actualizadas
    console.log('\n📊 6. Verificando estadísticas actualizadas...');
    const updatedStatsResponse = await makeRequest(`${BACKEND_URL}/api/notifications/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (updatedStatsResponse.data.success) {
      const updatedStats = updatedStatsResponse.data.data;
      console.log('📈 Estadísticas actualizadas:');
      console.log(`   Total: ${updatedStats.total}`);
      console.log(`   No leídas: ${updatedStats.unread}`);
      console.log(`   Alta prioridad: ${updatedStats.highPriority}`);
      console.log(`   Hoy: ${updatedStats.today}`);
    }

    // 7. Probar marcar todas como leídas
    console.log('\n✅ 7. Probando marcar todas como leídas...');
    const markAllReadResponse = await makeRequest(`${BACKEND_URL}/api/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Respuesta marcar todas como leídas:', {
      statusCode: markAllReadResponse.statusCode,
      success: markAllReadResponse.data.success
    });

    if (markAllReadResponse.data.success) {
      console.log('✅ Todas las notificaciones marcadas como leídas');
    }

    console.log('\n🎉 Prueba de notificaciones del header completada exitosamente');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testHeaderNotifications();
