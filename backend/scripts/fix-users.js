const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar el modelo de usuario
const { User } = require('../src/models/User');

// Cadena de conexión de Atlas
const MONGODB_URI = process.env.MONGODB_URI;

async function fixUsers() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!');

    // Eliminar usuarios existentes
    console.log('🧹 Eliminando usuarios existentes...');
    await User.deleteMany({});
    console.log('✅ Usuarios eliminados');

    // Crear usuarios con contraseñas correctas
    console.log('👥 Creando usuarios con contraseñas correctas...');
    
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔐 Hash generado:', hashedPassword);

    const users = [
      {
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'slp',
        slp: {
          licenseNumber: '123456789',
          specialization: ['articulation', 'language'],
          yearsOfExperience: 5,
          caseload: []
        }
      },
      {
        email: 'kjgriman@gmail.com',
        password: hashedPassword,
        firstName: 'Kerbin',
        lastName: 'Griman',
        role: 'slp',
        slp: {
          licenseNumber: '123456780',
          specialization: ['language'],
          yearsOfExperience: 9,
          caseload: []
        }
      },
      {
        email: 'child@test.com',
        password: hashedPassword,
        firstName: 'Ana',
        lastName: 'Martínez',
        role: 'child',
        child: {
          parentEmail: 'parent@test.com',
          skillLevel: 'beginner',
          primaryGoals: ['articulation', 'language'],
          sessionsCompleted: 0,
          totalSessionTime: 0
        }
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
    }

    // Probar autenticación
    console.log('\n🔍 Probando autenticación...');
    const testUser = await User.findOne({ email: 'test@test.com' });
    const isPasswordValid = await testUser.comparePassword('test123');
    console.log('🔐 Contraseña válida:', isPasswordValid);

    console.log('\n🎉 Usuarios arreglados exitosamente!');
    console.log('\n📋 Usuarios disponibles:');
    console.log('- test@test.com (SLP) - Password: test123');
    console.log('- kjgriman@gmail.com (SLP) - Password: test123');
    console.log('- child@test.com (Child) - Password: test123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

fixUsers();
