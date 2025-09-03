const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function testUserCredentials() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    // Obtener la conexión
    const db = mongoose.connection.db;

    // Verificar usuarios SLP
    console.log('👨‍⚕️ Verificando terapeutas:');
    const slps = await db.collection('users').find({ role: 'slp' }).toArray();
    
    slps.forEach((slp, index) => {
      console.log(`   ${index + 1}. ${slp.firstName} ${slp.lastName} (${slp.email})`);
      console.log(`      ID: ${slp._id}`);
      console.log(`      Password hash: ${slp.password.substring(0, 20)}...`);
      console.log('');
    });

    // Probar contraseñas comunes
    const commonPasswords = ['password123', '123456', 'password', 'test123', 'admin123'];
    
    for (const slp of slps) {
      console.log(`🔐 Probando contraseñas para ${slp.email}:`);
      
      for (const password of commonPasswords) {
        try {
          const isValid = await bcrypt.compare(password, slp.password);
          if (isValid) {
            console.log(`   ✅ Contraseña encontrada: "${password}"`);
            break;
          }
        } catch (error) {
          console.log(`   ❌ Error probando "${password}":`, error.message);
        }
      }
      console.log('');
    }

    // Crear un usuario de prueba si no hay ninguno con contraseña conocida
    console.log('🔧 Creando usuario de prueba...');
    const testPassword = 'password123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUser = {
      email: 'test@test.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      role: 'slp',
      slp: {
        licenseNumber: '123456789',
        specialization: ['articulation', 'language'],
        yearsOfExperience: 5
      }
    };

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('users').findOne({ email: 'test@test.com' });
    
    if (existingUser) {
      console.log('⚠️ Usuario test@test.com ya existe, actualizando contraseña...');
      await db.collection('users').updateOne(
        { email: 'test@test.com' },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Contraseña actualizada');
    } else {
      console.log('➕ Creando nuevo usuario de prueba...');
      await db.collection('users').insertOne(testUser);
      console.log('✅ Usuario creado');
    }

    console.log(`\n🎯 Credenciales de prueba:`);
    console.log(`   Email: test@test.com`);
    console.log(`   Password: ${testPassword}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB Atlas');
  }
}

testUserCredentials();
