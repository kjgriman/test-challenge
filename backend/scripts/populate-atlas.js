const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar el modelo de usuario
const { User } = require('../src/models/User');

// Cadena de conexión de Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://speech-therapy-user:speech-therapy-2024@cluster0.xxxxx.mongodb.net/speech-therapy?retryWrites=true&w=majority';

// Datos de usuarios de prueba
const testUsers = [
  {
    email: 'test@test.com',
    password: 'test123',
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
    password: 'test123',
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
    password: 'test123',
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

async function populateDatabase() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!');

    // Limpiar usuarios existentes
    console.log('🧹 Limpiando usuarios existentes...');
    await User.deleteMany({});
    console.log('✅ Usuarios eliminados');

    // Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Base de datos poblada exitosamente!');
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

populateDatabase();
