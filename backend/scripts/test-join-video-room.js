const http = require('http');

const BACKEND_URL = 'http://127.0.0.1:3001';

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
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

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

async function testVideoRooms() {
  try {
    console.log('🧪 Probando funcionalidad de salas de video...\n');

    // 1. Login para obtener token
    console.log('1. Iniciando sesión...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'slp@test.com',
      password: 'password123'
    });

    if (loginResponse.statusCode !== 200) {
      console.error('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Crear una sala de video
    console.log('2. Creando sala de video...');
    const createRoomResponse = await makeRequest('POST', '/api/video-rooms', {
      name: 'Sala de Prueba',
      description: 'Sala para probar la funcionalidad',
      maxParticipants: 5,
      settings: {
        allowScreenShare: true,
        allowChat: true,
        allowRecording: false,
        requireApproval: false
      }
    }, token);

    if (createRoomResponse.statusCode !== 200) {
      console.error('❌ Error creando sala:', createRoomResponse.data);
      return;
    }

    const roomId = createRoomResponse.data.data.videoRoom.roomId;
    console.log('✅ Sala creada exitosamente. Room ID:', roomId);

    // 3. Obtener todas las salas
    console.log('\n3. Obteniendo salas de video...');
    const getRoomsResponse = await makeRequest('GET', '/api/video-rooms', null, token);

    if (getRoomsResponse.statusCode !== 200) {
      console.error('❌ Error obteniendo salas:', getRoomsResponse.data);
      return;
    }

    console.log('✅ Salas obtenidas:', getRoomsResponse.data.data.videoRooms.length, 'salas');

    // 4. Unirse a la sala
    console.log('\n4. Uniéndose a la sala...');
    const joinRoomResponse = await makeRequest('POST', `/api/video-rooms/${roomId}/join`, {}, token);

    if (joinRoomResponse.statusCode !== 200) {
      console.error('❌ Error uniéndose a la sala:', joinRoomResponse.data);
      return;
    }

    console.log('✅ Unido a la sala exitosamente');

    // 5. Iniciar la sala
    console.log('\n5. Iniciando la sala...');
    const startRoomResponse = await makeRequest('POST', `/api/video-rooms/${roomId}/start`, {}, token);

    if (startRoomResponse.statusCode !== 200) {
      console.error('❌ Error iniciando la sala:', startRoomResponse.data);
      return;
    }

    console.log('✅ Sala iniciada exitosamente');

    // 6. Obtener información de la sala
    console.log('\n6. Obteniendo información de la sala...');
    const getRoomResponse = await makeRequest('GET', `/api/video-rooms/${roomId}`, null, token);

    if (getRoomResponse.statusCode !== 200) {
      console.error('❌ Error obteniendo información de la sala:', getRoomResponse.data);
      return;
    }

    const roomInfo = getRoomResponse.data.data.videoRoom;
    console.log('✅ Información de la sala:');
    console.log('   - Nombre:', roomInfo.name);
    console.log('   - Activa:', roomInfo.isActive);
    console.log('   - Participantes:', roomInfo.participants.length);
    console.log('   - Enlace compartir:', roomInfo.shareLink);

    // 7. Finalizar la sala
    console.log('\n7. Finalizando la sala...');
    const endRoomResponse = await makeRequest('POST', `/api/video-rooms/${roomId}/end`, {}, token);

    if (endRoomResponse.statusCode !== 200) {
      console.error('❌ Error finalizando la sala:', endRoomResponse.data);
      return;
    }

    console.log('✅ Sala finalizada exitosamente');

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

// Ejecutar las pruebas
testVideoRooms();
