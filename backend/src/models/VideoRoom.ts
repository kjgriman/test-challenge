import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoRoom extends Document {
  roomId: string;
  sessionId: string;
  title: string;
  createdBy: mongoose.Types.ObjectId;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    role: 'slp' | 'child';
    joinedAt: Date;
    isActive: boolean;
  }>;
  isActive: boolean;
  maxParticipants: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoRoomSchema = new Schema<IVideoRoom>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    default: 'Sala de Terapia'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['slp', 'child'],
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 4
  }
}, {
  timestamps: true
});

// Método para agregar participante
VideoRoomSchema.methods.addParticipant = function(userId: mongoose.Types.ObjectId, name: string, role: 'slp' | 'child') {
  const existingParticipant = (this as any).participants.find((p: any) => p.userId.toString() === userId.toString());
  
  if (existingParticipant) {
    // Actualizar participante existente
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    // Agregar nuevo participante
    (this as any).participants.push({
      userId,
      name,
      role,
      joinedAt: new Date(),
      isActive: true
    });
  }
  
  return (this as any).save();
};

// Método para remover participante
VideoRoomSchema.methods.removeParticipant = function(userId: mongoose.Types.ObjectId) {
  const participant = (this as any).participants.find((p: any) => p.userId.toString() === userId.toString());
  if (participant) {
    participant.isActive = false;
  }
  return (this as any).save();
};

// Método para obtener participantes activos
VideoRoomSchema.methods.getActiveParticipants = function() {
  return (this as any).participants.filter((p: any) => p.isActive);
};

// Método estático para generar roomId único
VideoRoomSchema.statics.generateRoomId = function(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const VideoRoom = mongoose.model<IVideoRoom>('VideoRoom', VideoRoomSchema);
