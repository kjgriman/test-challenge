const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const { User } = require('../src/models/User');
const { TherapySession } = require('../src/models/TherapySession');

// Cadena de conexión de Atlas
const MONGODB_URI = process.env.MONGODB_URI;

async function populateSessions() {
  try {
    console.log('🔌 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!');

    // Obtener usuarios existentes
    const slp = await User.findOne({ role: 'slp' });
    const child = await User.findOne({ role: 'child' });

    if (!slp || !child) {
      console.log('❌ Necesitas usuarios SLP y Child para crear sesiones');
      return;
    }

    console.log('👥 Usuarios encontrados:');
    console.log('- SLP:', slp.email);
    console.log('- Child:', child.email);

    // Limpiar sesiones existentes
    console.log('🧹 Limpiando sesiones existentes...');
    await TherapySession.deleteMany({});
    console.log('✅ Sesiones eliminadas');

    // Crear sesiones de prueba
    console.log('📅 Creando sesiones de prueba...');

    const sessions = [
      {
        slpId: slp._id,
        childId: child._id,
        type: 'Terapia del Habla',
        status: 'completed',
        duration: 45,
        accuracy: 85,
        gamesPlayed: 3,
        notes: 'Excelente progreso en articulación',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
      },
      {
        slpId: slp._id,
        childId: child._id,
        type: 'Juego Interactivo',
        status: 'completed',
        duration: 30,
        accuracy: 92,
        gamesPlayed: 2,
        notes: 'Muy buena participación en juegos de lenguaje',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
      },
      {
        slpId: slp._id,
        childId: child._id,
        type: 'Evaluación',
        status: 'completed',
        duration: 60,
        accuracy: 78,
        gamesPlayed: 1,
        notes: 'Evaluación inicial completada',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000)
      },
      {
        slpId: slp._id,
        childId: child._id,
        type: 'Terapia del Habla',
        status: 'in_progress',
        duration: 0,
        accuracy: 0,
        gamesPlayed: 0,
        notes: 'Sesión en progreso',
        createdAt: new Date(),
        scheduledDate: new Date(),
        startTime: new Date()
      },
      {
        slpId: slp._id,
        childId: child._id,
        type: 'Juego Interactivo',
        status: 'scheduled',
        duration: 0,
        accuracy: 0,
        gamesPlayed: 0,
        notes: 'Próxima sesión programada',
        createdAt: new Date(),
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 días en el futuro
      }
    ];

    for (const sessionData of sessions) {
      const session = new TherapySession(sessionData);
      await session.save();
      console.log(`✅ Sesión creada: ${sessionData.type} (${sessionData.status})`);
    }

    // Actualizar el child para que tenga el SLP asignado
    await User.findByIdAndUpdate(child._id, {
      'child.currentSLP': slp._id,
      'child.sessionsCompleted': 3,
      'child.totalSessionTime': 135
    });

    console.log('\n🎉 Sesiones creadas exitosamente!');
    console.log('\n📊 Resumen:');
    console.log('- Sesiones completadas: 3');
    console.log('- Sesión activa: 1');
    console.log('- Sesión programada: 1');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

populateSessions();
