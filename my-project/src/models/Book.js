import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
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

const Book = mongoose.model('Book', bookSchema);

export default Book;
