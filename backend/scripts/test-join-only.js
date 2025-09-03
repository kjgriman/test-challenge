const http = require('http');

// Función para hacer una petición HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testJoinVideoRoom() {
  try {
    console.log('🧪 Probando funcionalidad de unirse a salas de video...\n');

    // Probar diferentes credenciales
    const credentials = [
      { email: 'slp@test.com', password: 'password123' },
      { email: 'admin@test.com', password: 'password123' },
      { email: 'test@test.com', password: 'password123' },
      { email: 'user@test.com', password: 'password123' }
    ];

    let token = null;
    let userEmail = '';

    // Intentar login con diferentes credenciales
    for (const cred of credentials) {
      console.log(`Intentando login con: ${cred.email}`);
      const loginResponse = await makeRequest('POST', '/api/auth/login', cred);

      console.log('Status:', loginResponse.statusCode);
      
      if (loginResponse.statusCode === 200) {
        token = loginResponse.data.data.token;
        userEmail = cred.email;
        console.log('✅ Login exitoso con:', cred.email);
        break;
      } else {
        console.log('❌ Login falló con:', cred.email);
      }
    }

    if (!token) {
      console.error('❌ No se pudo hacer login con ninguna credencial');
      return;
    }

    console.log('\n✅ Login exitoso\n');

    // 2. Crear una sala de video
    console.log('2. Creando sala de video...');
    const createRoomResponse = await makeRequest('POST', '/api/video-rooms', {
      name: 'Sala de Prueba Join',
      description: 'Sala para probar la funcionalidad de unirse',
      maxParticipants: 5,
      settings: {
        allowScreenShare: true,
        allowChat: true,
        allowRecording: false,
        requireApproval: false
      }
    }, token);

    console.log('Status:', createRoomResponse.statusCode);
    console.log('Response:', JSON.stringify(createRoomResponse.data, null, 2));

    if (createRoomResponse.statusCode !== 200) {
      console.error('❌ Error creando sala');
      return;
    }

    const roomId = createRoomResponse.data.data.videoRoom.roomId;
    console.log('✅ Sala creada exitosamente. Room ID:', roomId);

    // 3. Unirse a la sala
    console.log('\n3. Uniéndose a la sala...');
    const joinRoomResponse = await makeRequest('POST', `/api/video-rooms/${roomId}/join`, {}, token);

    console.log('Status:', joinRoomResponse.statusCode);
    console.log('Response:', JSON.stringify(joinRoomResponse.data, null, 2));

    if (joinRoomResponse.statusCode !== 200) {
      console.error('❌ Error uniéndose a la sala');
      return;
    }

    console.log('✅ Unido a la sala exitosamente');

    // 4. Obtener información de la sala para verificar
    console.log('\n4. Verificando información de la sala...');
    const getRoomResponse = await makeRequest('GET', `/api/video-rooms/${roomId}`, null, token);

    console.log('Status:', getRoomResponse.statusCode);
    console.log('Response:', JSON.stringify(getRoomResponse.data, null, 2));

    if (getRoomResponse.statusCode !== 200) {
      console.error('❌ Error obteniendo información de la sala');
      return;
    }

    const roomInfo = getRoomResponse.data.data.videoRoom;
    console.log('✅ Información de la sala:');
    console.log('   - Nombre:', roomInfo.name);
    console.log('   - Activa:', roomInfo.isActive);
    console.log('   - Participantes:', roomInfo.participants.length);
    console.log('   - Enlace compartir:', roomInfo.shareLink);

    console.log('\n🎉 Prueba de unirse completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testJoinVideoRoom();
