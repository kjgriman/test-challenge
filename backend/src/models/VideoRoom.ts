import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoRoom extends Document {
  roomId: string;
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  maxParticipants: number;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    role: 'slp' | 'child' | 'guest';
    joinedAt: Date;
    isActive: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
  }>;
  settings: {
    allowScreenShare: boolean;
    allowChat: boolean;
    allowRecording: boolean;
    requireApproval: boolean;
    isPublic: boolean;
    allowGuests: boolean;
  };
  invitations: Array<{
    userId: mongoose.Types.ObjectId;
    email: string;
    role: 'slp' | 'child' | 'guest';
    invitedAt: Date;
    status: 'pending' | 'accepted' | 'declined';
    acceptedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const videoRoomSchema = new Schema<IVideoRoom>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
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
      enum: ['slp', 'child', 'guest'],
      default: 'guest'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isMuted: {
      type: Boolean,
      default: false
    },
    isVideoOff: {
      type: Boolean,
      default: false
    }
  }],
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    allowGuests: {
      type: Boolean,
      default: true
    }
  },
  invitations: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['slp', 'child', 'guest'],
      default: 'guest'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    acceptedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Método para generar un roomId aleatorio
(videoRoomSchema.statics as any).generateRoomId = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Método para verificar si el roomId es único
(videoRoomSchema.statics as any).isRoomIdUnique = async function(roomId: string): Promise<boolean> {
  const existingRoom = await this.findOne({ roomId });
  return !existingRoom;
};

// Método para iniciar la sala
(videoRoomSchema.methods as any).startRoom = async function(): Promise<void> {
  (this as any).isActive = true;
  (this as any).startedAt = new Date();
  await (this as any).save();
};

// Método para finalizar la sala
(videoRoomSchema.methods as any).endRoom = async function(): Promise<void> {
  (this as any).isActive = false;
  (this as any).endedAt = new Date();
  // Marcar todos los participantes como inactivos
  (this as any).participants.forEach((participant: any) => {
    participant.isActive = false;
  });
  await (this as any).save();
};

// Método para agregar participante
(videoRoomSchema.methods as any).addParticipant = async function(
  userId: mongoose.Types.ObjectId,
  name: string,
  role: 'slp' | 'child' | 'guest' = 'guest'
): Promise<void> {
  const existingParticipant = (this as any).participants.find(
    (p: any) => p.userId.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    // Actualizar participante existente
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    // Verificar límite de participantes
    const activeParticipants = (this as any).participants.filter((p: any) => p.isActive).length;
    if (activeParticipants >= (this as any).maxParticipants) {
      throw new Error('La sala ha alcanzado el límite máximo de participantes');
    }
    
    // Agregar nuevo participante
    (this as any).participants.push({
      userId,
      name,
      role,
      joinedAt: new Date(),
      isActive: true,
      isMuted: false,
      isVideoOff: false
    });
  }
  
  await (this as any).save();
};

// Método para remover participante
(videoRoomSchema.methods as any).removeParticipant = async function(
  userId: mongoose.Types.ObjectId
): Promise<void> {
  const participant = (this as any).participants.find(
    (p: any) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.isActive = false;
    await (this as any).save();
  }
};

// Método para obtener participantes activos
(videoRoomSchema.methods as any).getActiveParticipants = function(): any[] {
  return (this as any).participants.filter((p: any) => p.isActive);
};

// Método para obtener el enlace de la sala
(videoRoomSchema.methods as any).getShareLink = function(): string {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/video-rooms/join/${(this as any).roomId}`;
};

export const VideoRoom = mongoose.model<IVideoRoom>('VideoRoom', videoRoomSchema);
