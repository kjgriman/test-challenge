import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    SLP = "slp",// Speech Language Pathologist
    CHILD = "child"
}
export declare enum SkillLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export interface IUser extends Document {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    profilePicture?: string;
    slp?: {
        licenseNumber: string;
        specialization: string[];
        yearsOfExperience: number;
        caseload: mongoose.Types.ObjectId[];
    };
    child?: {
        parentEmail: string;
        skillLevel: SkillLevel;
        primaryGoals: string[];
        currentSLP?: mongoose.Types.ObjectId;
        sessionsCompleted: number;
        totalSessionTime: number;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
    getFullName(): string;
    getDisplayName(): string;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map