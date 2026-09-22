const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User'); // Added to update spammer report counts
const auth = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Send a message to a seller
router.post('/', auth, async (req, res) => {
  try {
    // 1. Extract the ai_evaluation payload sent by the frontend
    const { receiverId, listingId, content, ai_evaluation } = req.body;
    
    // Stop the process immediately if the message is empty!
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }
    
    const cleanContent = content.trim();

    // --- 🛡️ BEHAVIORAL SHIELD (Node.js Math) 🛡️ ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = await Message.find({ 
      sender: req.user.id, 
      createdAt: { $gte: oneHourAgo } 
    });

    let exactMatchCount = 0;
    for (let msg of recentMessages) {
      if (msg.content.toLowerCase() === cleanContent.toLowerCase()) {
        exactMatchCount++;
      }
    }

    if (exactMatchCount >= 3) {
      console.warn(`[BLOCKED] User ${req.user.id} triggered repeated_message_count anomaly.`);
      await User.findByIdAndUpdate(req.user.id, { $inc: { reportCount: 1 } });
      return res.status(403).json({ 
        message: 'Spam detected. You have sent this exact message too many times recently.' 
      });
    }

    // --- 🤖 AI CONTENT SHIELD (Frontend Payload) ---
    if (ai_evaluation) {
      if (ai_evaluation.risk_label === 'High-risk') {
        console.warn(`[BLOCKED] Message rejected by AI NLP model.`);
        return res.status(403).json({ 
          message: 'Message blocked by Trust & Safety AI for suspicious content.' 
        });
      }
    } else {
      console.log("⚠️ No AI message evaluation attached, proceeding cautiously.");
    }
    // ----------------------------------------------
    
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      listing: listingId,
      content: cleanContent
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