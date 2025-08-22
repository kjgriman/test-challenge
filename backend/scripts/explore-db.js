const mongoose = require('mongoose');

// Conectar a MongoDB
const MONGODB_URI = 'mongodb://127.0.0.1:27017/speech-therapy';

async function exploreDatabase() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    // Obtener la conexión
    const db = mongoose.connection.db;

    // Listar todas las colecciones
    console.log('📚 Colecciones en la base de datos:');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   No hay colecciones creadas aún.');
      console.log('   Las colecciones se crearán automáticamente cuando registres usuarios.');
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }

    console.log('\n📊 Información de la base de datos:');
    const stats = await db.stats();
    console.log(`   Nombre: ${stats.dbName}`);
    console.log(`   Tamaño: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Colecciones: ${stats.collections}`);
    console.log(`   Documentos: ${stats.objects}`);

    // Mostrar esquemas definidos
    console.log('\n🏗️  Esquemas definidos en la aplicación:');
    console.log('   - User (usuarios y terapeutas)');
    console.log('   - TherapySession (sesiones de terapia)');
    console.log('   - Game (juegos educativos)');

    // Si hay datos, mostrarlos
    if (collections.length > 0) {
      console.log('\n📋 Datos en las colecciones:');
      
      for (const collection of collections) {
        console.log(`\n   📁 Colección: ${collection.name}`);
        const documents = await db.collection(collection.name).find({}).limit(5).toArray();
        
        if (documents.length === 0) {
          console.log('      No hay documentos en esta colección.');
        } else {
          console.log(`      Documentos encontrados: ${documents.length}`);
          documents.forEach((doc, index) => {
            console.log(`      ${index + 1}. ${JSON.stringify(doc, null, 2)}`);
          });
        }
      }
    }

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Ejecuta el servidor backend: npm run dev');
    console.log('   2. Registra un usuario desde el frontend');
    console.log('   3. Vuelve a ejecutar este script para ver los datos');

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('\n💡 Asegúrate de que MongoDB esté ejecutándose:');
    console.log('   - Instala MongoDB Community Server');
    console.log('   - O usa Docker: docker run -d -p 27017:27017 mongo:7.0');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
exploreDatabase();
