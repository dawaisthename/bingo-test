import mongoose, { Document, Model, Schema } from 'mongoose';

const { model } = mongoose;

interface IParnership {
    partnership_name: string;
    phone: string;
    location: string;
    package_type: string
    username: string;
    password: string;
    status: number; // active or inactive
    percent: string;
}

export interface IParnershipDocument extends IParnership, Document {}

const ParnershipSchema: Schema<IParnershipDocument> = new Schema<IParnershipDocument>({
    partnership_name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
    percent:  {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const ParnershipModel: Model<IParnershipDocument> = model<IParnershipDocument>('Parnership', ParnershipSchema);

export default ParnershipModel;

