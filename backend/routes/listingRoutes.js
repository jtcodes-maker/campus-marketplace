const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing'); // The Listing blueprint
const User = require('../models/User'); // We need the User blueprint to get the seller's info!
const auth = require('../middleware/auth'); // Our new bouncer!
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;

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

      // 2. Grab the URLs Cloudinary generated
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          imageUrls.push(file.path);
        }
      }

      // 3. Save the gig to MongoDB
      const newListing = new Listing({
        seller: req.user.id, 
        title,
        description,
        price,
        category,
        images: imageUrls,
      });

      const savedListing = await newListing.save();
      console.log("✅ Gig saved successfully to database!");
      res.status(201).json(savedListing);

    } catch (error) {
      // 4. Did MongoDB crash?
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
    // 1. Grab BOTH search and category from the URL!
    const { search, category } = req.query; 
    let query = {}; 

    // 2. If they typed a search, add it to the filter
    if (search) {
      query.title = { $regex: search, $options: 'i' }; 
    }
    
    // 3. If they clicked a category button, add it to the filter
    if (category) {
      query.category = category; 
    }

    // 4. Find the listings that match our combined filters
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
    // Find all listings where the 'seller' matches the logged-in user's ID
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

    // Security Check: Make sure the person editing is the one who created it!
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to edit this item' });
    }

    // Grab the new data from the request
    const { title, description, price, category } = req.body;

    // Update the fields (if a field wasn't changed, keep the old one)
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

    // Security Check: Ensure the person deleting it actually owns it!
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
    // If the ID is completely malformed, it throws a specific error
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
    // 1. Find the seller's public info (Exclude their password and email for security!)
    const seller = await User.findById(req.params.id).select('-password -email');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // 2. Find all listings created by this specific seller
    const listings = await Listing.find({ seller: req.params.id })
      .populate('seller', 'name')
      .sort({ createdAt: -1 });

    // 3. Package them together and send them to the frontend!
    res.json({ seller, listings });
  } catch (error) {
    console.error('Fetch Seller Profile Error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

module.exports = router;