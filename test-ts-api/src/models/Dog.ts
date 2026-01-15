import mongoose, { Schema, Document } from 'mongoose';

export interface IDog extends Document {
    name: string;
    description?: string;
}

const dogSchema = new Schema<IDog>({
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

const Dog = mongoose.model<IDog>('Dog', dogSchema);

export default Dog;
