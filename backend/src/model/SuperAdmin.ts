import mongoose, { Document, Model, Schema } from 'mongoose';

const { model } = mongoose;

interface ISuperAdmin {
    username: string;
    password: string;
    email: string;
    type: string;
}

export interface ISuperAdminDocument extends ISuperAdmin, Document {}

const SuperAdminSchema: Schema<ISuperAdminDocument> = new Schema<ISuperAdminDocument>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const SuperAdminModel: Model<ISuperAdminDocument> = model<ISuperAdminDocument>('SuperAdmin', SuperAdminSchema);

export default SuperAdminModel;

