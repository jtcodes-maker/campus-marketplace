const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User blueprint we made earlier

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

    // 4. Create the new student using our User model
    const newStudent = new User({
      name,
      email,
      password: hashedPassword,
      university
    });

    // 5. Save the student to MongoDB Atlas
    const savedStudent = await newStudent.save();

    // 6. Send a success message back (without sending the password back!)
    res.status(201).json({
      _id: savedStudent._id,
      name: savedStudent.name,
      email: savedStudent.email,
      university: savedStudent.university,
      message: 'Student registered successfully!'
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
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