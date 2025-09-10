const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function updateTestUserPassword() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Obtener la colección de usuarios
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Buscar el usuario test@test.com
    const testUser = await usersCollection.findOne({ email: 'test@test.com' });
    if (!testUser) {
      console.log('❌ Usuario test@test.com no encontrado');
      return;
    }
    
    console.log('🔍 Usuario encontrado:', testUser.email);
    
    // Generar nuevo hash para la contraseña test123
    const newPassword = 'test123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔐 Generando nuevo hash para contraseña...');
    
    // Actualizar la contraseña
    const result = await usersCollection.updateOne(
      { email: 'test@test.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log(`   Email: test@test.com`);
      console.log(`   Nueva contraseña: test123`);
      console.log(`   Hash generado: ${hashedPassword.substring(0, 20)}...`);
    } else {
      console.log('⚠️  No se pudo actualizar la contraseña');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
  }
}

updateTestUserPassword();
