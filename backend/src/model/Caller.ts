import mongoose, { Document, Model, Schema } from 'mongoose';

const { model } = mongoose;

interface ICaller {
    username: string;
    password: string;
    branch_name: string;
    owner: string;
    location: string;
    phone: string;
}

export interface ICallerDocument extends ICaller, Document {}

const CallerSchema: Schema<ICallerDocument> = new Schema<ICallerDocument>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    branch_name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const CallerModel: Model<ICallerDocument> = model<ICallerDocument>('Caller', CallerSchema);

export default CallerModel;

