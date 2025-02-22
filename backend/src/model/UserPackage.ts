// models/UserPackageModel.ts
import mongoose, { Document, Model, Schema } from 'mongoose';
import { IPackageDocument } from './Package'; // Ensure correct import path

// Define the IUserPackage interface
interface IUserPackage {
    user_id: mongoose.Types.ObjectId; // Reference to the User model
    packages: {
        package: IPackageDocument['_id']; // Reference to PackageModel
        balance: number;
    }[];
}

// Extend the Document interface to include IUserPackage
export interface IUserPackageDocument extends IUserPackage, Document {}

// Define the Schema with both DocType and ModelType generic parameters
const UserPackageSchema = new Schema<IUserPackageDocument, Model<IUserPackageDocument>>(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId, // Use mongoose.Schema.Types.ObjectId for consistency
            ref: 'User',
            required: true,
            unique: true, // One document per user
        },
        packages: [
            {
                package: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Package',
                    required: true,
                },
                balance: {
                    type: Number,
                    required: true,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Create the Model with the correct generic parameter
const UserPackageModel: Model<IUserPackageDocument> = mongoose.model<IUserPackageDocument>(
    'UserPackage',
    UserPackageSchema
);

export default UserPackageModel;
