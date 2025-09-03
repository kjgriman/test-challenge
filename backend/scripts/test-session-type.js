const https = require('https');
const http = require('http');

function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
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

async function testSessionType() {
  try {
    console.log('🧪 Probando sessionType en sesiones...');
    
    // Login
    const loginResponse = await makeRequest('http://127.0.0.1:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');

    // Crear una sesión con sessionType
    const createSessionData = {
      childId: '68a7d2300340a0d24405e84a', // ID del estudiante Ana Martínez
      scheduledDate: '2024-01-15T10:00:00.000Z',
      duration: 45,
      sessionType: 'evaluation',
      notes: 'Sesión de prueba',
      goals: ['Mejorar pronunciación', 'Aumentar vocabulario']
    };

    console.log('📝 Creando sesión con sessionType:', createSessionData.sessionType);
    const createResponse = await makeRequest('http://127.0.0.1:3001/api/sessions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(createSessionData)
    });

    if (createResponse.status === 201) {
      console.log('✅ Sesión creada exitosamente');
      console.log('📋 Datos de la sesión creada:', createResponse.data.data);
    } else {
      console.log('❌ Error creando sesión:', createResponse.data);
      return;
    }

    // Obtener todas las sesiones
    console.log('🔍 Obteniendo todas las sesiones...');
    const sessionsResponse = await makeRequest('http://127.0.0.1:3001/api/sessions', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json' 
      }
    });

    if (sessionsResponse.status === 200) {
      console.log('✅ Sesiones obtenidas exitosamente');
      const sessions = sessionsResponse.data.data.sessions;
      console.log(`📊 Total de sesiones: ${sessions.length}`);
      
      sessions.forEach((session, index) => {
        console.log(`\n📋 Sesión ${index + 1}:`);
        console.log(`   ID: ${session._id}`);
        console.log(`   Tipo: ${session.sessionType || 'NO DEFINIDO'}`);
        console.log(`   Estado: ${session.status}`);
        console.log(`   Fecha: ${session.scheduledDate}`);
        console.log(`   Duración: ${session.duration} minutos`);
      });
    } else {
      console.log('❌ Error obteniendo sesiones:', sessionsResponse.data);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testSessionType();
