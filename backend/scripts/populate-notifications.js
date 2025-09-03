const mongoose = require('mongoose');
const { Notification } = require('../dist/models/Notification');
const { User } = require('../dist/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://speech-therapy-user:speech-therapy-user@cluster0.bkezwbh.mongodb.net/speech-therapy?retryWrites=true&w=majority&appName=Cluster0';

async function populateNotifications() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener un usuario SLP para crear notificaciones
    const user = await User.findOne({ role: 'slp' });
    if (!user) {
      console.log('❌ No se encontró ningún usuario SLP');
      return;
    }

    console.log(`👤 Usuario encontrado: ${user.firstName} ${user.lastName}`);

    // Crear notificaciones de ejemplo
    const notifications = [
      {
        userId: user._id,
        title: 'Nueva sesión programada',
        message: 'Se ha programado una nueva sesión de terapia para mañana a las 10:00 AM con Ana Martínez',
        type: 'info',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Ver sesión'
      },
      {
        userId: user._id,
        title: 'Sesión completada exitosamente',
        message: 'La sesión con Ana Martínez se ha completado con un 85% de precisión',
        type: 'success',
        priority: 'low',
        actionUrl: '/sessions/history',
        actionText: 'Ver detalles'
      },
      {
        userId: user._id,
        title: 'Recordatorio de sesión',
        message: 'Tienes una sesión programada en 30 minutos con Ana Martínez',
        type: 'warning',
        priority: 'high',
        actionUrl: '/sessions/active',
        actionText: 'Unirse ahora'
      },
      {
        userId: user._id,
        title: 'Error en el sistema',
        message: 'Se ha detectado un problema temporal con el sistema de juegos. Se está trabajando para solucionarlo.',
        type: 'error',
        priority: 'high'
      },
      {
        userId: user._id,
        title: 'Nuevo estudiante asignado',
        message: 'Se te ha asignado un nuevo estudiante: Carlos Rodríguez. Revisa su perfil para comenzar la evaluación.',
        type: 'info',
        priority: 'medium',
        actionUrl: '/students',
        actionText: 'Ver perfil'
      },
      {
        userId: user._id,
        title: 'Actualización del sistema',
        message: 'Se ha actualizado el sistema con nuevas funcionalidades para mejorar la experiencia de terapia',
        type: 'info',
        priority: 'low'
      },
      {
        userId: user._id,
        title: 'Progreso destacado',
        message: 'Ana Martínez ha mostrado un progreso excepcional en los últimos ejercicios de articulación',
        type: 'success',
        priority: 'medium',
        actionUrl: '/students',
        actionText: 'Ver progreso'
      },
      {
        userId: user._id,
        title: 'Sesión cancelada',
        message: 'La sesión programada para hoy a las 2:00 PM ha sido cancelada por el padre de Ana Martínez',
        type: 'warning',
        priority: 'medium',
        actionUrl: '/sessions',
        actionText: 'Reprogramar'
      }
    ];

    // Crear las notificaciones
    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Se crearon ${createdNotifications.length} notificaciones`);

    // Mostrar algunas estadísticas
    const total = await Notification.countDocuments({ userId: user._id });
    const unread = await Notification.countDocuments({ userId: user._id, read: false });
    const highPriority = await Notification.countDocuments({ userId: user._id, priority: 'high' });

    console.log('\n📊 Estadísticas de notificaciones:');
    console.log(`   Total: ${total}`);
    console.log(`   No leídas: ${unread}`);
    console.log(`   Alta prioridad: ${highPriority}`);

    console.log('\n🎉 Población de notificaciones completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
populateNotifications();
