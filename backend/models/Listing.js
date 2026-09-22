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
  image_hash: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Sold', 'Draft'],
  },
  ai_risk_score: {
    type: Number,
    default: 0
  },
  ai_flags: [
    { type: String } // Stores the exact reasons the AI flagged it
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);