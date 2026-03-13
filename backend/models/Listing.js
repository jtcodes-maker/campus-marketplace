const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // This creates a relationship linking this listing to a specific student
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Tutoring', 'Textbooks', 'Electronics', 'Dorm Essentials', 'Services', 'Other'], // Keeps categories clean
  },
  images: [
    { type: String } // An array of image URLs
  ],
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Sold', 'Draft'],
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);