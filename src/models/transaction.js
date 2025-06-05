const mongoose = require('mongoose');
const { Schema } = mongoose;
const { model } = mongoose;

transactionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  }, // credit or debit
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  recipient: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  sender: {
    type: String,
  },
  senderName: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = model('Transaction', transactionSchema);
module.exports = Transaction;
