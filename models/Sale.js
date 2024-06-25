const mongoose = require('mongoose');

const Sale = mongoose.model('Sale', {
    product: String,
    quantity: Number,
    price: Number,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Sale;
