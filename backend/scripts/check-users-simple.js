const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/speech-therapy-platform');

// Schema de Usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['slp', 'child'], required: true },
  profilePicture: { type: String, default: null },
  slp: {
    licenseNumber: { type: String },
    specialization: [{ type: String }],
    yearsOfExperience: { type: Number },
    caseloadCount: { type: Number, default: 0 }
  },
  child: {
    dateOfBirth: { type: Date },
    parentEmail: { type: String },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    goals: [{ type: String }],
    notes: { type: String }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    const users = await User.find({});
    console.log(`📊 Total de usuarios encontrados: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 Usuario ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Creado: ${user.createdAt}`);
    });
    
    // Buscar usuario específico
    const testUser = await User.findOne({ email: 'test@test.com' });
    if (testUser) {
      console.log('\n✅ Usuario test@test.com encontrado:');
      console.log(`   Nombre: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   Rol: ${testUser.role}`);
    } else {
      console.log('\n❌ Usuario test@test.com NO encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
