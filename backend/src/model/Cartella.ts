import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

// Interface for Cartella
export interface ICartella extends Document {
  cartellaNumber: number;
  cells: string[][];
  partnershipId: mongoose.Types.ObjectId;
  branchName: string;
  createdAt: Date;
  updatedAt: Date;
  cellsHash?: string;
}

// Define the cells dimensions
const ROWS = 5;
const COLS = 5;
const FREE_CELL = 'Free';

// Create the Cartella Schema
const CartellaSchema: Schema<ICartella> = new Schema(
  {
    cartellaNumber: {
      type: Number,
      required: true,
    },
    cells: {
      type: [[String]],
      required: true,
      validate: {
        validator: function (cells: string[][]) {
          // Ensure it's a 5x5 grid
          if (cells.length !== ROWS) return false;
          for (let row of cells) {
            if (row.length !== COLS) return false;
          }
          // Ensure the center cell is 'Free'
          return cells[2][2] === FREE_CELL;
        },
        message: `Cells must be a ${ROWS}x${COLS} grid with the center cell as '${FREE_CELL}'.`,
      },
    },
    partnershipId: {
      type: Schema.Types.ObjectId,
      ref: 'Partnership',
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    cellsHash: {
      type: String,
      required: false, // Set this as optional because the middleware will populate it before saving
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate the cellsHash
CartellaSchema.pre<ICartella>('save', function (next) {
  console.log('Pre-save middleware triggered'); // Debugging output

  // Ensure the center cell is 'Free'
  if (this.cells[2][2] !== FREE_CELL) {
    this.cells[2][2] = FREE_CELL;
  }

  // Convert the cells array to string and generate a hash
  const cellsString = JSON.stringify(this.cells);
  // console.log('Cells string:', cellsString);  // Debugging output

  this.cellsHash = crypto.createHash('sha256').update(cellsString).digest('hex');
  // console.log('Generated cellsHash:', this.cellsHash);  // Debugging output

  next();
});

// Export the Cartella model
export default mongoose.model<ICartella>('Cartella', CartellaSchema);
