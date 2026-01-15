import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    name: string;
    description?: string;
    price?: number;
}

const itemSchema = new Schema<IItem>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        default: 0,
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;
