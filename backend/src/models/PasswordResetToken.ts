import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
passwordResetTokenSchema.index({ email: 1 });
passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Método para verificar si el token es válido
passwordResetTokenSchema.methods.isValid = function(): boolean {
  return !this.used && this.expiresAt > new Date();
};

// Método para marcar el token como usado
passwordResetTokenSchema.methods.markAsUsed = function(): Promise<IPasswordResetToken> {
  this.used = true;
  return this.save();
};

export default mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
