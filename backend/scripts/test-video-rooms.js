const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// Importar modelos
const User = require('../src/models/User');
const VideoRoom = require('../src/models/VideoRoom');

async function testVideoRooms() {
  try {
    console.log('🧪 Iniciando pruebas del sistema de salas...');

    // Limpiar datos existentes
    await User.deleteMany({ email: { $in: ['test-slp@test.com', 'test-child@test.com'] } });
    await VideoRoom.deleteMany({});

    // Crear usuario SLP de prueba
    const slpPassword = await bcrypt.hash('test123', 10);
    const slpUser = new User({
      firstName: 'Profesor',
      lastName: 'Test',
      email: 'test-slp@test.com',
      password: slpPassword,
      role: 'slp',
      slp: {
        licenseNumber: 'SLP123456',
        specializations: ['Trastornos del habla', 'Autismo'],
        yearsOfExperience: 5,
        caseloadCount: 0
      }
    });
    await slpUser.save();
    console.log('✅ Usuario SLP creado:', slpUser.email);

    // Crear usuario Child de prueba
    const childPassword = await bcrypt.hash('test123', 10);
    const childUser = new User({
      firstName: 'Niño',
      lastName: 'Test',
      email: 'test-child@test.com',
      password: childPassword,
      role: 'child',
      child: {
        skillLevel: 'beginner',
        goals: ['Mejorar pronunciación', 'Aumentar vocabulario'],
        sessionsCompleted: 0,
        totalSessionTime: 0,
        currentSLP: slpUser._id,
        notes: 'Niño de prueba para el sistema'
      }
    });
    await childUser.save();
    console.log('✅ Usuario Child creado:', childUser.email);

    // Crear sala de prueba
    const roomId = VideoRoom.generateRoomId();
    const videoRoom = new VideoRoom({
      roomId,
      sessionId: 'test-session-001',
      title: 'Sesión de Prueba - Terapia del Habla',
      createdBy: slpUser._id,
      participants: [{
        userId: slpUser._id,
        name: `${slpUser.firstName} ${slpUser.lastName}`,
        role: slpUser.role,
        joinedAt: new Date(),
        isActive: true
      }]
    });
    await videoRoom.save();
    console.log('✅ Sala de prueba creada:', roomId);

    // Agregar el niño a la sala
    await videoRoom.addParticipant(
      childUser._id,
      `${childUser.firstName} ${childUser.lastName}`,
      childUser.role
    );
    console.log('✅ Niño agregado a la sala');

    // Mostrar información final
    console.log('\n📋 RESUMEN DE PRUEBA:');
    console.log('='.repeat(50));
    console.log('👨‍🏫 Profesor SLP:');
    console.log(`   Email: test-slp@test.com`);
    console.log(`   Password: test123`);
    console.log(`   ID: ${slpUser._id}`);
    
    console.log('\n👶 Niño:');
    console.log(`   Email: test-child@test.com`);
    console.log(`   Password: test123`);
    console.log(`   ID: ${childUser._id}`);
    
    console.log('\n🏠 Sala de Videoconferencia:');
    console.log(`   Room ID: ${roomId}`);
    console.log(`   Título: ${videoRoom.title}`);
    console.log(`   Creada por: ${slpUser.firstName} ${slpUser.lastName}`);
    console.log(`   Participantes: ${videoRoom.getActiveParticipants().length}`);
    
    console.log('\n🔗 Para probar:');
    console.log('1. Inicia sesión como SLP (test-slp@test.com)');
    console.log('2. Ve a Videoconferencias');
    console.log('3. Verás la sala creada');
    console.log('4. Copia el Room ID');
    console.log('5. Inicia sesión como Child (test-child@test.com)');
    console.log('6. Ve a Videoconferencias');
    console.log('7. Haz clic en "Unirse a Sala"');
    console.log('8. Pega el Room ID y únete');
    console.log('9. Ambos estarán en la misma sala');

    console.log('\n✅ Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

testVideoRooms();
