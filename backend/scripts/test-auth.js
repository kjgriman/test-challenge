const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar el modelo de usuario
const { User } = require('../src/models/User');

// Cadena de conexión de Atlas
const MONGODB_URI = process.env.MONGODB_URI;

async function testAuth() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!');

    // Buscar usuario
    const user = await User.findOne({ email: 'test@test.com' });
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:', {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Probar comparación de contraseña
    const password = 'test123';
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Contraseña válida:', isPasswordValid);

    // Probar métodos
    console.log('👤 Nombre completo:', user.getFullName());
    console.log('🎭 Nombre de display:', user.getDisplayName());

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

testAuth();
