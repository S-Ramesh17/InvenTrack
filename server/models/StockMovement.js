const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  remarks: {
    type: String,
    trim: true,
    default: '',
  },
  performedBy: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
