const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar el modelo de usuario
const { User } = require('../src/models/User');

// Cadena de conexión de Atlas
const MONGODB_URI = process.env.MONGODB_URI;

async function debugPassword() {
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

    console.log('📋 Información del usuario:');
    console.log('- Email:', user.email);
    console.log('- Password hash:', user.password);
    console.log('- Password length:', user.password.length);

    // Probar hash manual
    const password = 'test123';
    console.log('\n🔍 Probando hash manual:');
    console.log('- Password original:', password);
    
    const manualHash = await bcrypt.hash(password, 12);
    console.log('- Hash manual:', manualHash);
    console.log('- Hash manual length:', manualHash.length);
    
    const manualCompare = await bcrypt.compare(password, manualHash);
    console.log('- Comparación manual:', manualCompare);
    
    const storedCompare = await bcrypt.compare(password, user.password);
    console.log('- Comparación con almacenado:', storedCompare);

    // Crear nuevo hash y comparar
    console.log('\n🔄 Creando nuevo usuario para comparar:');
    const newHash = await bcrypt.hash(password, 12);
    console.log('- Nuevo hash:', newHash);
    
    const newCompare = await bcrypt.compare(password, newHash);
    console.log('- Comparación con nuevo hash:', newCompare);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

debugPassword();
