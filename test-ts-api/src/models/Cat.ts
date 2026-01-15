import mongoose, { Schema, Document } from 'mongoose';

export interface ICat extends Document {
    name: string;
    description?: string;
}

const catSchema = new Schema<ICat>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

const Cat = mongoose.model<ICat>('Cat', catSchema);

export default Cat;
