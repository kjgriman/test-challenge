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

async function testStudentsEndpoint() {
  try {
    console.log('🧪 Probando endpoint de estudiantes...');
    
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

    // Ahora probar el endpoint de estudiantes
    const studentsResponse = await makeRequest('http://localhost:3001/api/students', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (studentsResponse.status !== 200) {
      console.log('❌ Error obteniendo estudiantes:', studentsResponse.data);
      return;
    }

    const studentsData = JSON.parse(studentsResponse.data);
    console.log('✅ Estudiantes obtenidos exitosamente');
    console.log('📊 Total estudiantes:', studentsData.data.pagination.total);
    console.log('👥 Estudiantes:');
    studentsData.data.students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testStudentsEndpoint();
