const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing'); // The Listing blueprint
const auth = require('../middleware/auth'); // Our new bouncer!
const upload = require('../middleware/upload');

// @route   POST /api/listings
// @desc    Create a new listing/gig WITH IMAGES
// @access  Private
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    // 1. Grab text details
    const { title, description, price, category } = req.body;

    // 2. If files were uploaded, Cloudinary gives us the URLs in req.files!
    // We map through them and create an array of just the secure URL strings.
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    // 3. Create the new listing
    const newListing = new Listing({
      seller: req.user.id,
      title,
      description,
      price,
      category,
      images: imageUrls // Save our new Cloudinary URLs to MongoDB!
    });

    const savedListing = await newListing.save();
    res.status(201).json(savedListing);

  } catch (error) {
    console.error('Listing Creation Error:', error);
    res.status(500).json({ message: 'Server error while creating listing' });
  }
});

// --- ADD THIS NEW ROUTE ---

// @route   GET /api/listings
// @desc    Get all active listings (Marketplace feed) WITH Search & Filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    // 1. Grab the search terms from the URL query
    const { keyword, category } = req.query;

    // 2. Start our database query by always asking for 'Active' listings
    let dbQuery = { status: 'Active' };

    // 3. If the user typed a keyword, search the title OR description
    if (keyword) {
      dbQuery.$or = [
        { title: { $regex: keyword, $options: 'i' } }, // 'i' means case-insensitive (ignores capital letters)
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 4. If the user clicked a specific category filter, add it to the search
    if (category) {
      dbQuery.category = category;
    }

    // 5. Run the search with our dynamic dbQuery
    const listings = await Listing.find(dbQuery)
      .sort({ createdAt: -1 })
      .populate('seller', 'name university profileImage');

    res.json(listings);

  } catch (error) {
    console.error('Fetch Listings Error:', error);
    res.status(500).json({ message: 'Server error while fetching listings' });
  }
});

// ---------------------------

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
      .populate('seller', 'name university profileImage bio');

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

module.exports = router;