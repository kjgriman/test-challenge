const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function checkUsers() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Obtener la colección de usuarios
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Contar usuarios
    const userCount = await usersCollection.countDocuments();
    console.log(`📊 Total de usuarios en la base de datos: ${userCount}`);
    
    // Listar usuarios
    const users = await usersCollection.find({}).toArray();
    console.log('\n👥 Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Creado: ${user.createdAt}`);
      console.log('---');
    });
    
    // Verificar usuario específico
    const testUser = await usersCollection.findOne({ email: 'test@test.com' });
    if (testUser) {
      console.log('\n🔍 Usuario test@test.com encontrado:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Nombre: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   Rol: ${testUser.role}`);
      console.log(`   Password Hash: ${testUser.password ? 'EXISTS' : 'NOT_FOUND'}`);
      console.log(`   ID: ${testUser._id}`);
    } else {
      console.log('\n❌ Usuario test@test.com NO encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB Atlas');
  }
}

checkUsers();
