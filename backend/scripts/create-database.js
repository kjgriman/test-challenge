const mongoose = require('mongoose');

// Conectar a MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/speech-therapy';

async function createDatabase() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    const db = mongoose.connection.db;

    // Crear la base de datos insertando un documento temporal
    console.log('📝 Creando base de datos speech-therapy...');
    
    // Crear una colección temporal para inicializar la base de datos
    await db.collection('_init').insertOne({
      message: 'Base de datos inicializada',
      timestamp: new Date(),
      version: '1.0.0'
    });

    console.log('✅ Base de datos speech-therapy creada exitosamente!');

    // Mostrar información de la base de datos
    console.log('\n📊 Información de la base de datos:');
    const stats = await db.stats();
    console.log(`   Nombre: ${stats.dbName}`);
    console.log(`   Tamaño: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Colecciones: ${stats.collections}`);
    console.log(`   Documentos: ${stats.objects}`);

    // Listar colecciones
    console.log('\n📚 Colecciones creadas:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    // Eliminar el documento temporal
    await db.collection('_init').deleteOne({});
    console.log('\n🧹 Documento temporal eliminado');

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Ejecuta el servidor backend: npm run dev');
    console.log('   2. Registra un usuario desde el frontend');
    console.log('   3. Verás las colecciones users, therapysessions, games');
    console.log('   4. En MongoDB Compass, conecta a: mongodb://localhost:27017');
    console.log('   5. Navega a la base de datos: speech-therapy');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que MongoDB esté ejecutándose:');
    console.log('   - Abre MongoDB Compass');
    console.log('   - O ejecuta mongod en una terminal separada');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
createDatabase();
