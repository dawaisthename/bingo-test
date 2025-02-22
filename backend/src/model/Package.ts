import mongoose, { Document, Model, Schema } from 'mongoose';

interface IPackage {
    packageName	: string;
    packageAmount: number;
    percent: number;
}

export interface IPackageDocument extends IPackage, Document {}

const PackageSchema: Schema<IPackageDocument> = new Schema<IPackageDocument>({
    packageName	: {
        type: String,
        required: true,
        unique: true, // Ensure package names are unique
    },
    packageAmount: {
        type: Number,
        required: true,
    },
    percent: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

const PackageModel: Model<IPackageDocument> = mongoose.model<IPackageDocument>('Package', PackageSchema);

export default PackageModel;
