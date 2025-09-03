const mongoose = require('mongoose');

// Conectar a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function assignStudentToSLP() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    // Obtener la conexión
    const db = mongoose.connection.db;

    // Obtener el SLP de prueba
    const testSLP = await db.collection('users').findOne({ email: 'test@test.com' });
    if (!testSLP) {
      console.log('❌ SLP de prueba no encontrado');
      return;
    }

    console.log('👨‍⚕️ SLP de prueba encontrado:', testSLP.firstName, testSLP.lastName);

    // Obtener el estudiante
    const student = await db.collection('users').findOne({ email: 'child@test.com' });
    if (!student) {
      console.log('❌ Estudiante no encontrado');
      return;
    }

    console.log('👥 Estudiante encontrado:', student.firstName, student.lastName);
    console.log('📋 currentSLP actual:', student.child?.currentSLP);

    // Asignar el estudiante al SLP
    const result = await db.collection('users').updateOne(
      { email: 'child@test.com' },
      { 
        $set: { 
          'child.currentSLP': testSLP._id 
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Estudiante asignado al SLP exitosamente');
      
      // Verificar la asignación
      const updatedStudent = await db.collection('users').findOne({ email: 'child@test.com' });
      console.log('📋 currentSLP después de la asignación:', updatedStudent.child?.currentSLP);
    } else {
      console.log('⚠️ No se pudo asignar el estudiante al SLP');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB Atlas');
  }
}

assignStudentToSLP();
