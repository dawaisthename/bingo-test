import mongoose, { Document, Model, Schema } from 'mongoose';

const { model } = mongoose;

interface ITotalProfit {
    total_profit: number;
}

export interface ITotalProfitDocument extends ITotalProfit, Document {}

const TotalProfitSchema: Schema<ITotalProfitDocument> = new Schema<ITotalProfitDocument>(
    {
        total_profit: {
            type: Number,
            required: true,
            default: 0,  // Initialize total profit with zero
        }
    },
    {
        timestamps: true,
    }
);

const TotalProfitModel: Model<ITotalProfitDocument> = model<ITotalProfitDocument>('Total Profit', TotalProfitSchema);

export default TotalProfitModel;
