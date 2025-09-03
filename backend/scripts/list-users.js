const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://sweetcherrytech:123456789@cluster0.mongodb.net/speech-therapy?retryWrites=true&w=majority', {
  family: 4,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

async function listUsers() {
  try {
    console.log('🔍 Listando usuarios en la base de datos...\n');
    
    // Importar el modelo User
    const User = require('../dist/models/User').User;
    
    const users = await User.find({}).select('email firstName lastName role');
    
    console.log('Usuarios encontrados:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   Rol: ${user.role}`);
      console.log('');
    });
    
    if (users.length === 0) {
      console.log('No se encontraron usuarios en la base de datos.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();
