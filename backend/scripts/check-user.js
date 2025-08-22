const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Importar el modelo de Usuario
const { User } = require('../src/models/User');

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario test@test.com...');
    
    const user = await User.findOne({ email: 'test@test.com' });
    
    if (user) {
      console.log('✅ Usuario encontrado:');
      console.log('  - ID:', user._id);
      console.log('  - Email:', user.email);
      console.log('  - Nombre:', user.firstName, user.lastName);
      console.log('  - Rol:', user.role);
      console.log('  - Creado:', user.createdAt);
    } else {
      console.log('❌ Usuario test@test.com no encontrado');
    }
    
    // También verificar todos los usuarios
    console.log('\n📋 Todos los usuarios en la base de datos:');
    const allUsers = await User.find({});
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUser();
