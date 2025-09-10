const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    console.log('🔍 Verificando si el usuario test@test.com existe...');
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: 'test@test.com' });
    
    if (existingUser) {
      console.log('✅ Usuario test@test.com ya existe:');
      console.log(`   Nombre: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   Rol: ${existingUser.role}`);
      console.log(`   Creado: ${existingUser.createdAt}`);
      
      // Actualizar contraseña
      console.log('\n🔄 Actualizando contraseña...');
      existingUser.password = await bcrypt.hash('test123', 12);
      await existingUser.save();
      console.log('✅ Contraseña actualizada a: test123');
      
    } else {
      console.log('❌ Usuario test@test.com NO encontrado');
      console.log('🆕 Creando usuario de prueba...');
      
      // Crear usuario de prueba
      const hashedPassword = await bcrypt.hash('test123', 12);
      
      const testUser = new User({
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Usuario',
        lastName: 'Prueba',
        role: 'slp',
        slp: {
          licenseNumber: 'TEST123456',
          specialization: ['language'],
          yearsOfExperience: 5,
          caseloadCount: 0
        }
      });
      
      await testUser.save();
      console.log('✅ Usuario test@test.com creado exitosamente');
      console.log(`   Email: test@test.com`);
      console.log(`   Contraseña: test123`);
      console.log(`   Nombre: ${testUser.firstName} ${testUser.lastName}`);
      console.log(`   Rol: ${testUser.role}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
