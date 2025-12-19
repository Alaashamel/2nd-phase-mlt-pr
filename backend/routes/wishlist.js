const express = require("express");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's wishlist
router.get("/", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("user", "name email");

    if (!wishlist) {
      return res.json({ items: [] });
    }

    res.json({ items: wishlist.items });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add item to wishlist
router.post("/add/:productId", auth, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }

    // Check if item already in wishlist
    const existingItem = wishlist.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    wishlist.items.push({
      product: productId,
    });

    await wishlist.save();
    await wishlist.populate("items.product");

    res.json({
      message: "Item added to wishlist",
      wishlist: wishlist.items,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove item from wishlist
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await wishlist.save();
    await wishlist.populate("items.product");

    res.json({
      message: "Item removed from wishlist",
      wishlist: wishlist.items,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Check if product is in wishlist
router.get("/check/:productId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.json({ inWishlist: false });
    }

    const inWishlist = wishlist.items.some(
      (item) => item.product.toString() === req.params.productId
    );

    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Clear wishlist
router.delete("/clear", auth, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
