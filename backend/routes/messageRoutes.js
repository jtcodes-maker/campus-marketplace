const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @route   POST /api/messages
// @desc    Send a message (and create conversation if it doesn't exist)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, listingId, text } = req.body;
    const senderId = req.user.id;

    // 1. Check if these two users already have a conversation about this specific item
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      listing: listingId
    });

    // 2. If no conversation exists, create a new one!
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        listing: listingId,
        lastMessage: text
      });
      await conversation.save();
    } else {
      // If it does exist, just update the "last message" preview
      conversation.lastMessage = text;
      await conversation.save();
    }

    // 3. Create and save the actual message
    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: text
    });
    
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);

  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// @route   GET /api/messages/inbox
// @desc    Get all conversations for the logged-in user
// @access  Private
router.get('/inbox', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name profileImage')
    .populate('listing', 'title images')
    .sort({ updatedAt: -1 }); // Newest conversations at the top

    res.json(conversations);
  } catch (error) {
    console.error('Fetch Inbox Error:', error);
    res.status(500).json({ message: 'Server error while fetching inbox' });
  }
});

// @route   GET /api/messages/:conversationId
// @desc    Get all messages for a specific conversation
// @access  Private
router.get('/:conversationId', auth, async (req, res) => {
  try {
    // Find all messages for this chat, sort by oldest first (top-to-bottom reading)
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 }); 
      
    res.json(messages);
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

module.exports = router;