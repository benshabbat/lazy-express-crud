import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
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

const Item = mongoose.model('Item', itemSchema);

export default Item;
