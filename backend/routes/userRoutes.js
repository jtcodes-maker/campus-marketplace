const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User blueprint we made earlier
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/users/register
// @desc    Register a new student
router.post('/register', async (req, res) => {
  try {
    // 1. Grab the data the user typed into the form
    const { name, email, password, university } = req.body;

    // 2. Check if a student is already registered with this email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A student with this email already exists on campus!' });
    }

    // 3. Secure the password (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- NEW: Generate a random 6-digit verification code ---
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Create the new student (Now including the code and unverified status!)
    const newStudent = new User({
      name,
      email,
      password: hashedPassword,
      university,
      verificationCode: generatedCode, 
      isVerified: false 
    });

    // 5. Save the student to MongoDB Atlas
    const savedStudent = await newStudent.save();

    // --- NEW: Send the verification email ---
    // We use .catch() here so if the email fails, it doesn't crash the whole server
    sendEmail(savedStudent.email, generatedCode).catch((err) => {
        console.error("Failed to send verification email:", err);
    });

    // 6. Send a success message back (Without the password or the secret code!)
    res.status(201).json({
      _id: savedStudent._id,
      name: savedStudent.name,
      email: savedStudent.email,
      university: savedStudent.university,
      isVerified: savedStudent.isVerified,
      message: 'Student registered successfully! Please check your email for the verification code.'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify a student's email with the 6-digit code
router.post('/verify', async (req, res) => {
  try {
    // 1. Grab the email and the code the user typed in
    const { email, code } = req.body;

    // 2. Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Did they already verify?
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. You can log in!' });
    }

    // 4. Does the code match?
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    // 5. IT MATCHES! Let's officially verify them.
    user.isVerified = true;
    user.verificationCode = undefined; // Wipe the code from the database for security
    
    await user.save();

    res.status(200).json({ message: 'Student verified successfully! You can now log in.' });

  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists in our database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    // NEW: The Verification Bouncer!
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please check your email and verify your account before logging in.' });
    }

    // 2. Check if the password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
    }

    // 3. Create the JWT Payload (the data we want to attach to the ID card)
    const payload = {
      user: {
        id: user._id // We store the user's database ID in the token
      }
    };

    // 4. Sign the token and send it back to the user
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }, // The ID card expires in 30 days
      (err, token) => {
        if (err) throw err;
        res.json({
          token, // This is the digital ID card!
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          }
        });
      }
    );

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;