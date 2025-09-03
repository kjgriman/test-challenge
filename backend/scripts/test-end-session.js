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

async function testEndSession() {
  try {
    console.log('🧪 Iniciando prueba de finalización de sesión...');
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

    // 2. Obtener sesiones para encontrar una en progreso
    console.log('\n📋 2. Obteniendo sesiones...');
    const sessionsResponse = await makeRequest(`${BACKEND_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Respuesta de sesiones:', {
      statusCode: sessionsResponse.statusCode,
      success: sessionsResponse.data.success,
      totalSessions: sessionsResponse.data.data?.sessions?.length || 0
    });

    if (!sessionsResponse.data.success) {
      console.log('❌ Error obteniendo sesiones:', sessionsResponse.data);
      return;
    }

    const sessions = sessionsResponse.data.data.sessions || [];
    console.log('📋 Sesiones encontradas:', sessions.length);

    // Mostrar detalles de cada sesión
    sessions.forEach((session, index) => {
      console.log(`\n📋 Sesión ${index + 1}:`);
      console.log(`   ID: ${session._id}`);
      console.log(`   Estado: ${session.status}`);
      console.log(`   Tipo: ${session.sessionType}`);
      console.log(`   Fecha: ${session.scheduledDate}`);
      console.log(`   Duración: ${session.duration} minutos`);
      console.log(`   StartTime: ${session.startTime}`);
      console.log(`   EndTime: ${session.endTime}`);
    });

    // 3. Buscar una sesión en progreso
    const inProgressSession = sessions.find(s => s.status === 'in_progress');
    
    if (!inProgressSession) {
      console.log('\n⚠️ No hay sesiones en progreso. Intentando iniciar una sesión...');
      
      // Buscar una sesión programada
      const scheduledSession = sessions.find(s => s.status === 'scheduled');
      
      if (!scheduledSession) {
        console.log('❌ No hay sesiones programadas para iniciar');
        return;
      }

      console.log(`\n▶️ Iniciando sesión: ${scheduledSession._id}`);
      
      const startResponse = await makeRequest(`${BACKEND_URL}/api/sessions/${scheduledSession._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Respuesta de inicio:', {
        statusCode: startResponse.statusCode,
        success: startResponse.data.success
      });

      if (!startResponse.data.success) {
        console.log('❌ Error iniciando sesión:', startResponse.data);
        return;
      }

      // Usar la sesión recién iniciada
      const sessionToEnd = startResponse.data.data;
      console.log('✅ Sesión iniciada, procediendo a finalizarla...');
      
      // 4. Finalizar la sesión
      console.log(`\n⏹️ Finalizando sesión: ${sessionToEnd._id}`);
      
      const endData = {
        notes: 'Sesión de prueba finalizada',
        gamesPlayed: 3,
        accuracy: 85
      };

      console.log('📦 Datos a enviar:', endData);

      const endResponse = await makeRequest(`${BACKEND_URL}/api/sessions/${sessionToEnd._id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, endData);

      console.log('📊 Respuesta de finalización:', {
        statusCode: endResponse.statusCode,
        success: endResponse.data.success
      });

      if (endResponse.data.success) {
        console.log('✅ Sesión finalizada exitosamente');
        console.log('📋 Datos de la sesión finalizada:', endResponse.data.data);
      } else {
        console.log('❌ Error finalizando sesión:', endResponse.data);
      }

    } else {
      console.log(`\n⏹️ Finalizando sesión en progreso: ${inProgressSession._id}`);
      
      const endData = {
        notes: 'Sesión de prueba finalizada',
        gamesPlayed: 3,
        accuracy: 85
      };

      console.log('📦 Datos a enviar:', endData);

      const endResponse = await makeRequest(`${BACKEND_URL}/api/sessions/${inProgressSession._id}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, endData);

      console.log('📊 Respuesta de finalización:', {
        statusCode: endResponse.statusCode,
        success: endResponse.data.success
      });

      if (endResponse.data.success) {
        console.log('✅ Sesión finalizada exitosamente');
        console.log('📋 Datos de la sesión finalizada:', endResponse.data.data);
      } else {
        console.log('❌ Error finalizando sesión:', endResponse.data);
      }
    }

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testEndSession();
