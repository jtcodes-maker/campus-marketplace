const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two students can use the same email
    match: [/.+\@.+\..+/, 'Please use a valid university email address'],
  },
  password: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true, // Crucial for keeping it campus-specific
  },
  bio: {
    type: String,
    default: 'A student looking to buy and sell on campus!',
  },
  profileImage: {
    type: String,
    default: "" // by default, they have no picture
  },
  // --- NEW VERIFICATION FIELDS ---
  isVerified: { type: Boolean, default: false }, // Everyone starts as unverified!
  verificationCode: { type: String }, // Stores the 6-digit code
  // --- AVAILABILITY SETTINGS ---
  isAvailable: { type: Boolean, default: true }, // Everyone starts as available
  awayMessage: { type: String, default: '' },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

module.exports = mongoose.model('User', userSchema);