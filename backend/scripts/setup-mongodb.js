const mongoose = require('mongoose');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkMongoDBStatus() {
  console.log('🔍 Verificando estado de MongoDB...\n');

  // Verificar si MongoDB está instalado
  try {
    await execAsync('mongod --version');
    console.log('✅ MongoDB está instalado');
  } catch (error) {
    console.log('❌ MongoDB no está instalado');
    console.log('📥 Descarga MongoDB desde: https://mongodb.com/try/download/community');
    return false;
  }

  // Verificar si Docker está disponible
  try {
    await execAsync('docker --version');
    console.log('✅ Docker está disponible');
    return 'docker';
  } catch (error) {
    console.log('❌ Docker no está disponible');
    return 'local';
  }
}

async function startMongoDBWithDocker() {
  console.log('\n🐳 Iniciando MongoDB con Docker...');
  
  try {
    // Verificar si el contenedor ya existe
    try {
      await execAsync('docker ps -a --filter "name=mongodb-speech-therapy" --format "{{.Names}}"');
      console.log('📦 Contenedor MongoDB ya existe');
    } catch (error) {
      console.log('📦 Creando contenedor MongoDB...');
      await execAsync('docker run --name mongodb-speech-therapy -d -p 27017:27017 mongo:7.0');
    }

    // Iniciar el contenedor si no está ejecutándose
    await execAsync('docker start mongodb-speech-therapy');
    console.log('✅ MongoDB iniciado con Docker');
    
    // Esperar un momento para que MongoDB se inicialice
    console.log('⏳ Esperando que MongoDB se inicialice...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return true;
  } catch (error) {
    console.error('❌ Error iniciando MongoDB con Docker:', error.message);
    return false;
  }
}

async function exploreDatabase() {
  const MONGODB_URI = 'mongodb://127.0.0.1:27017/speech-therapy';

  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente!\n');

    const db = mongoose.connection.db;

    // Información de la base de datos
    console.log('📊 Información de la base de datos:');
    const stats = await db.stats();
    console.log(`   Nombre: ${stats.dbName}`);
    console.log(`   Tamaño: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Colecciones: ${stats.collections}`);
    console.log(`   Documentos: ${stats.objects}`);

    // Listar colecciones
    console.log('\n📚 Colecciones:');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   No hay colecciones creadas aún.');
      console.log('   Las colecciones se crearán automáticamente cuando registres usuarios.');
    } else {
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    }

    // Mostrar esquemas disponibles
    console.log('\n🏗️  Esquemas disponibles en la aplicación:');
    console.log('   - User (usuarios y terapeutas)');
    console.log('   - TherapySession (sesiones de terapia)');
    console.log('   - Game (juegos educativos)');

    // Mostrar datos si existen
    if (collections.length > 0) {
      console.log('\n📋 Datos en las colecciones:');
      
      for (const collection of collections) {
        console.log(`\n   📁 Colección: ${collection.name}`);
        const count = await db.collection(collection.name).countDocuments();
        console.log(`      Documentos: ${count}`);
        
        if (count > 0) {
          const documents = await db.collection(collection.name).find({}).limit(3).toArray();
          documents.forEach((doc, index) => {
            console.log(`      ${index + 1}. ${JSON.stringify(doc, null, 2)}`);
          });
        }
      }
    }

    console.log('\n🎯 Comandos útiles:');
    console.log('   - Para ver logs del contenedor: docker logs mongodb-speech-therapy');
    console.log('   - Para detener MongoDB: docker stop mongodb-speech-therapy');
    console.log('   - Para iniciar MongoDB: docker start mongodb-speech-therapy');
    console.log('   - Para eliminar contenedor: docker rm mongodb-speech-therapy');

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

async function main() {
  console.log('🚀 Configurando MongoDB para Speech Therapy...\n');

  const mongoStatus = await checkMongoDBStatus();
  
  if (mongoStatus === 'docker') {
    const started = await startMongoDBWithDocker();
    if (started) {
      await exploreDatabase();
    } else {
      console.log('\n💡 Alternativas:');
      console.log('   1. Instala MongoDB Community Server');
      console.log('   2. Inicia Docker Desktop manualmente');
    }
  } else if (mongoStatus === 'local') {
    console.log('\n💡 Para usar MongoDB localmente:');
    console.log('   1. Instala MongoDB Community Server');
    console.log('   2. Ejecuta: mongod');
    console.log('   3. Vuelve a ejecutar este script');
  } else {
    console.log('\n💡 Instala MongoDB primero:');
    console.log('   - Descarga desde: https://mongodb.com/try/download/community');
    console.log('   - O instala Docker Desktop');
  }
}

main();
