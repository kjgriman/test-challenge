const mongoose = require('mongoose');

// Conectar a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function checkStudents() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    // Obtener la conexión
    const db = mongoose.connection.db;

    // Verificar usuarios con rol 'child'
    console.log('👥 Verificando estudiantes (usuarios con rol "child"):');
    const students = await db.collection('users').find({ role: 'child' }).toArray();
    
    if (students.length === 0) {
      console.log('   ❌ No hay estudiantes registrados en la base de datos.');
      console.log('   💡 Necesitas registrar al menos un estudiante para crear sesiones.');
    } else {
      console.log(`   ✅ Encontrados ${students.length} estudiantes:`);
      students.forEach((student, index) => {
        console.log(`      ${index + 1}. ${student.firstName} ${student.lastName} (${student.email})`);
        console.log(`         ID: ${student._id}`);
        console.log(`         Rol: ${student.role}`);
        if (student.child) {
          console.log(`         Nivel: ${student.child.skillLevel}`);
          console.log(`         Email padre: ${student.child.parentEmail}`);
        }
        console.log('');
      });
    }

    // Verificar usuarios con rol 'slp'
    console.log('👨‍⚕️ Verificando terapeutas (usuarios con rol "slp"):');
    const slps = await db.collection('users').find({ role: 'slp' }).toArray();
    
    if (slps.length === 0) {
      console.log('   ❌ No hay terapeutas registrados en la base de datos.');
    } else {
      console.log(`   ✅ Encontrados ${slps.length} terapeutas:`);
      slps.forEach((slp, index) => {
        console.log(`      ${index + 1}. ${slp.firstName} ${slp.lastName} (${slp.email})`);
        console.log(`         ID: ${slp._id}`);
        console.log(`         Rol: ${slp.role}`);
        if (slp.slp) {
          console.log(`         Licencia: ${slp.slp.licenseNumber}`);
          console.log(`         Especialización: ${slp.slp.specialization.join(', ')}`);
        }
        console.log('');
      });
    }

    // Verificar sesiones existentes
    console.log('📅 Verificando sesiones existentes:');
    const sessions = await db.collection('therapysessions').find({}).toArray();
    
    if (sessions.length === 0) {
      console.log('   📝 No hay sesiones creadas aún.');
    } else {
      console.log(`   ✅ Encontradas ${sessions.length} sesiones:`);
      sessions.forEach((session, index) => {
        console.log(`      ${index + 1}. Sesión ID: ${session._id}`);
        console.log(`         Fecha: ${session.scheduledDate}`);
        console.log(`         Estado: ${session.status}`);
        console.log(`         Tipo: ${session.sessionType}`);
        console.log(`         SLP ID: ${session.slpId}`);
        console.log(`         Child ID: ${session.childId}`);
        console.log('');
      });
    }

    console.log('🎯 Recomendaciones:');
    if (students.length === 0) {
      console.log('   1. Registra al menos un estudiante desde el frontend');
      console.log('   2. Asegúrate de que el estudiante esté asignado a un SLP');
    }
    if (slps.length === 0) {
      console.log('   1. Registra al menos un terapeuta (SLP) desde el frontend');
    }
    if (students.length > 0 && slps.length > 0) {
      console.log('   1. Ya puedes crear sesiones desde el frontend');
      console.log('   2. Usa el ID de un estudiante existente para crear sesiones');
    }

  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB Atlas');
  }
}

// Ejecutar el script
checkStudents();
