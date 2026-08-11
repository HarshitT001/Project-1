const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now },
    weight: Number,
    caloriesConsumed: Number,
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProgressLog', progressSchema);
