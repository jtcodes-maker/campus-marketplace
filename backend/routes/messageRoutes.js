const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Send a message to a seller
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, listingId, content } = req.body;
    
    // NEW: Stop the process immediately if the message is empty!
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }
    
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      listing: listingId,
      content: content.trim() // .trim() removes any accidental extra spaces
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Message Send Error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// @route   GET /api/messages
// @desc    Get all messages for the logged-in user (Inbox)
router.get('/', auth, async (req, res) => {
  try {
    // Find messages where the user is either the sender OR the receiver
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate('listing', 'title images')
    .sort({ createdAt: -1 }); // Newest messages first
    
    res.json(messages);
  } catch (error) {
    console.error('Inbox Fetch Error:', error);
    res.status(500).json({ message: 'Server error while fetching inbox' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Security Check: Only the sender or receiver can delete this message!
    if (message.sender.toString() !== req.user.id && message.receiver.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this message' });
    }

    await message.deleteOne();
    res.json({ message: 'Message removed' });
  } catch (error) {
    console.error('Delete Message Error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
});

module.exports = router;