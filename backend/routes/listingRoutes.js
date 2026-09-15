const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing'); // The Listing blueprint
const User = require('../models/User'); // We need the User blueprint to get the seller's info!
const auth = require('../middleware/auth'); // Our new bouncer!
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// --- 🛡️ THE TEXT SHIELD SETUP 🛡️ ---
const Filter = require('bad-words');
const filter = new Filter();
// Add CampusGig's custom blacklist!
filter.addWords('nude', 'nudes', 'onlyfans', 'hookup', 'sugar', 'daddy', 'mommy');
// -----------------------------------

// Wrap multer so we can explicitly catch and log its background errors!
const uploadMiddleware = upload.array('images', 5);

// @route   POST /api/listings
// @desc    Create a new listing with image uploads
// @access  Private
router.post('/', auth, (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    
    // 1. Did the background image uploader crash?
    if (err) {
      console.error('🚨 Cloudinary/Upload Error:', err);
      return res.status(500).json({ message: 'Image upload failed. Check terminal.' });
    }

    try {
      console.log("✅ Route reached! Form Data:", req.body);
      console.log("✅ Files processed:", req.files?.length || 0);

      const { title, description, price, category } = req.body;

      // --- 🛑 THE TEXT SHIELD CHECK 🛑 ---
      if (filter.isProfane(title || '') || filter.isProfane(description || '')) {
        return res.status(400).json({ 
          message: 'Your listing contains inappropriate language. Please keep CampusGig professional.' 
        });
      }
      // -----------------------------------

      // 2. Grab the URLs Cloudinary generated
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          imageUrls.push(file.path);
        }
      }

      // --- 🤖 THE AI TRUST & SAFETY SHIELD 🤖 ---
      let aiScore = 0;
      let aiFlags = [];

      try {
        const sellerData = await User.findById(req.user.id);
        
        const aiPayload = {
          listing_id: "NEW_POST",
          title: title,             // <-- ADD THIS
          category: category,       // <-- ADD THIS
          description: description, 
          price_cleaned: parseFloat(price),
          desc_length: description ? description.length : 0,
          report_count: sellerData.reportCount || 0,
          repost_count: sellerData.repostCount || 0,
          off_platform_request: 0, 
          urgency_flag: 0,
          price_risk: 0 
        };

        console.log("🤖 Asking AI for clearance...");
        // Change the port from 5000 to 5001
        const aiResponse = await axios.post('http://localhost:5001/evaluate_listing', aiPayload);
        const riskData = aiResponse.data;

        aiScore = riskData.metadata_risk_score || 0;
        aiFlags = riskData.explanations || [];

        if (riskData.risk_label === 'High-risk') {
          console.warn(`[BLOCKED] Listing rejected by AI: ${aiFlags.join(', ')}`);
          return res.status(403).json({
            message: 'Listing blocked by Trust & Safety AI.',
            flags: aiFlags
          });
        }
      } catch (aiError) {
        console.error("🚨 AI Server unreachable, proceeding cautiously:", aiError.message);
      }
      // ------------------------------------------

      // 3. Save the gig to MongoDB (Including AI Data)
      const newListing = new Listing({
        seller: req.user.id, 
        title,
        description,
        price,
        category,
        images: imageUrls,
        ai_risk_score: aiScore,
        ai_flags: aiFlags
      });

      const savedListing = await newListing.save();
      console.log("✅ Gig saved successfully to database!");
      res.status(201).json(savedListing);

    } catch (error) {
      console.error('🚨 Database Error:', error);
      res.status(500).json({ message: 'Server error while saving to database.' });
    }
  });
});


// @route   GET /api/listings
// @desc    Get all active listings (with optional search AND category filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query; 
    let query = {}; 

    if (search) {
      query.title = { $regex: search, $options: 'i' }; 
    }
    
    if (category) {
      query.category = category; 
    }

    const listings = await Listing.find(query).populate('seller', 'name').sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Fetch Listings Error:', error);
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
});


// @route   GET /api/listings/me
// @desc    Get all listings created by the logged-in user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Fetch My Listings Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   PUT /api/listings/:id
// @desc    Update a listing's text details
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to edit this item' });
    }

    const { title, description, price, category } = req.body;

    // --- 🛑 TEXT SHIELD ON EDITS 🛑 ---
    if (filter.isProfane(title || '') || filter.isProfane(description || '')) {
      return res.status(400).json({ 
        message: 'Your update contains inappropriate language. Please keep CampusGig professional.' 
      });
    }
    // ----------------------------------

    // --- 🤖 THE AI TRUST & SAFETY SHIELD (ON EDIT) 🤖 ---
    try {
      const sellerData = await User.findById(req.user.id);
      
      const aiPayload = {
        listing_id: `EDIT_${listing._id}`,
        price_cleaned: parseFloat(price || listing.price),
        desc_length: description ? description.length : listing.description.length,
        report_count: sellerData.reportCount || 0,
        repost_count: sellerData.repostCount || 0,
        off_platform_request: 0,
        urgency_flag: 0,
        price_risk: 0
      };

      console.log("🤖 Asking AI for edit clearance...");
      const aiResponse = await axios.post('http://localhost:5000/evaluate_listing', aiPayload);
      const riskData = aiResponse.data;

      if (riskData.risk_label === 'High-risk') {
        console.warn(`[BLOCKED] Listing edit rejected by AI: ${(riskData.explanations || []).join(', ')}`);
        return res.status(403).json({
          message: 'Your update was blocked by the Trust & Safety AI.',
          flags: riskData.explanations || []
        });
      }
      
      // Update AI tracking stats on the listing
      listing.ai_risk_score = riskData.metadata_risk_score || 0;
      listing.ai_flags = riskData.explanations || [];

    } catch (aiError) {
      console.error("🚨 AI Server unreachable during edit, proceeding cautiously:", aiError.message);
    }
    // ----------------------------------------------------

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price || listing.price;
    listing.category = category || listing.category;

    const updatedListing = await listing.save();
    res.json(updatedListing);

  } catch (error) {
    console.error('Update Listing Error:', error);
    res.status(500).json({ message: 'Server error while updating listing' });
  }
});


// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this item' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed successfully' });

  } catch (error) {
    console.error('Delete Listing Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/listings/:id
// @desc    Get a single listing by its ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name isAvailable awayMessage');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Fetch Single Listing Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   GET /api/listings/seller/:id
// @desc    Get a public seller profile AND their active listings
// @access  Public
router.get('/seller/:id', async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('-password -email');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const listings = await Listing.find({ seller: req.params.id })
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    res.json({ seller, listings });
  } catch (error) {
    console.error('Fetch Seller Profile Error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;