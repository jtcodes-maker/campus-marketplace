const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  content: { type: String, required: true },
}, { timestamps: true }); // Automatically adds a 'createdAt' timestamp!

module.exports = mongoose.model('Message', messageSchema);