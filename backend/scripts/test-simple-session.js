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

async function testSimpleSessionCreation() {
  try {
    console.log('🧪 Iniciando prueba simple de creación de sesiones...');
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

    // 2. Obtener estudiantes disponibles
    console.log('\n👥 2. Obteniendo estudiantes...');
    const studentsResponse = await makeRequest(`${BACKEND_URL}/api/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!studentsResponse.data.success) {
      console.log('❌ Error obteniendo estudiantes:', studentsResponse.data);
      return;
    }

    const students = studentsResponse.data.data.students || [];
    if (students.length === 0) {
      console.log('❌ No hay estudiantes disponibles');
      return;
    }

    const student = students[0];
    console.log(`✅ Estudiante seleccionado: ${student.firstName} ${student.lastName}`);

    // 3. Obtener notificaciones antes de crear sesión
    console.log('\n📋 3. Obteniendo notificaciones antes de crear sesión...');
    const notificationsBeforeResponse = await makeRequest(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const notificationsBefore = notificationsBeforeResponse.data.data?.notifications || [];
    console.log(`📊 Notificaciones antes: ${notificationsBefore.length}`);

    // 4. Crear una nueva sesión
    console.log('\n📅 4. Creando nueva sesión...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const sessionData = {
      childId: student._id,
      scheduledDate: tomorrow.toISOString(),
      duration: 60,
      sessionType: 'therapy',
      notes: 'Sesión de prueba para notificaciones',
      goals: ['Mejorar articulación', 'Aumentar vocabulario']
    };

    const createSessionResponse = await makeRequest(`${BACKEND_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, sessionData);

    console.log('📊 Respuesta de creación de sesión:', {
      statusCode: createSessionResponse.statusCode,
      success: createSessionResponse.data.success,
      sessionId: createSessionResponse.data.data?._id,
      message: createSessionResponse.data.message
    });

    if (!createSessionResponse.data.success) {
      console.log('❌ Error creando sesión:', createSessionResponse.data);
      return;
    }

    const sessionId = createSessionResponse.data.data._id;
    console.log('✅ Sesión creada exitosamente:', sessionId);

    // 5. Esperar un momento para que se procesen las notificaciones
    console.log('\n⏳ 5. Esperando procesamiento de notificaciones...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Obtener notificaciones después de crear sesión
    console.log('\n📋 6. Obteniendo notificaciones después de crear sesión...');
    const notificationsAfterResponse = await makeRequest(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const notificationsAfter = notificationsAfterResponse.data.data?.notifications || [];
    console.log(`📊 Notificaciones después: ${notificationsAfter.length}`);

    // 7. Verificar nuevas notificaciones
    const newNotifications = notificationsAfter.filter(notif => 
      !notificationsBefore.some(before => before._id === notif._id)
    );

    console.log(`\n🔔 Nuevas notificaciones encontradas: ${newNotifications.length}`);
    newNotifications.forEach((notification, index) => {
      console.log(`\n📋 Nueva notificación ${index + 1}:`);
      console.log(`   ID: ${notification._id}`);
      console.log(`   Título: ${notification.title}`);
      console.log(`   Mensaje: ${notification.message}`);
      console.log(`   Tipo: ${notification.type}`);
      console.log(`   Prioridad: ${notification.priority}`);
      console.log(`   Leída: ${notification.read}`);
      console.log(`   Fecha: ${notification.createdAt}`);
    });

    // 8. Verificar que la sesión se guardó en la base de datos
    console.log('\n📋 8. Verificando que la sesión se guardó...');
    const sessionsResponse = await makeRequest(`${BACKEND_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (sessionsResponse.data.success) {
      const sessions = sessionsResponse.data.data.sessions || [];
      const createdSession = sessions.find(s => s._id === sessionId);
      
      if (createdSession) {
        console.log('✅ Sesión encontrada en la base de datos:');
        console.log(`   ID: ${createdSession._id}`);
        console.log(`   Estado: ${createdSession.status}`);
        console.log(`   Tipo: ${createdSession.sessionType}`);
        console.log(`   Fecha: ${createdSession.scheduledDate}`);
        console.log(`   Duración: ${createdSession.duration} minutos`);
      } else {
        console.log('❌ Sesión no encontrada en la base de datos');
      }
    } else {
      console.log('❌ Error obteniendo sesiones:', sessionsResponse.data);
    }

    console.log('\n🎉 Prueba simple de creación de sesiones completada exitosamente');

  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testSimpleSessionCreation();
