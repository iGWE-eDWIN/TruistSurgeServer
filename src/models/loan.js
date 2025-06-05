const mongoose = require('mongoose');
const { Schema } = mongoose;
const { model } = mongoose;

loanSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['student', 'personal', 'business', 'mortgage'],
  },
  amount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  },
  paymentPeriod: {
    type: Number,
    default: 12,
  }, // in months
  monthlyPayment: {
    type: Number,
  },
  totalPayment: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Loan = model('Loan', loanSchema);
module.exports = Loan;
