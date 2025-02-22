import mongoose, { Document, Model, Schema } from 'mongoose';

const { model } = mongoose;

interface ISales {
    partnership_id: string;
    bet: string;
    players: string;
    total_amount: string;
    cut: string;
    player_won: string,
    branch_name: string,
    winners: string;
    call: string;
    cashier: string;
    game_type: string;
}

export interface ISalesDocument extends ISales, Document {}

const SalesSchema: Schema<ISalesDocument> = new Schema<ISalesDocument>({
    partnership_id: {
        type: String,
        required: true,
    },
    bet: {
        type: String,
        required: true,
    },
    players: {
        type: String,
        required: true,
    },
    total_amount: {
        type: String,
        required: true,
    },
    cut: {
        type: String,
        required: true,
    },
    player_won: {
        type: String,
        required: true,
    },
    winners: {
        type: String,
        required: true,
    },
    call: {
        type: String,
        required: true,
    },
    branch_name: {
        type: String,
        required: true,
    }    ,
    cashier: {
        type: String,
        required: true,
    },
    game_type: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

const SalesModel: Model<ISalesDocument> = model<ISalesDocument>('Sales', SalesSchema);

export default SalesModel;

