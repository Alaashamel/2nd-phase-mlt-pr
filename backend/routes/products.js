const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption.price = 1;
        break;
      case "price-high":
        sortOption.price = -1;
        break;
      case "rating":
        sortOption.rating = -1;
        break;
      case "name":
        sortOption.name = 1;
        break;
      default:
        sortOption.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get featured products (first 4)
router.get("/featured/home", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ rating: -1, createdAt: -1 })
      .limit(4);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Clear all products (for development)
router.delete("/clear", async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: "All products cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Seed initial products (for development)
router.post("/seed", async (req, res) => {
  try {
    const products = [
      {
        name: "Classic White T-Shirt",
        price: 24.99,
        category: "men",
        rating: 4,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description:
          "Premium quality cotton t-shirt that offers exceptional comfort and durability.",
        details: [
          "100% Premium Cotton",
          "Machine Washable",
          "Regular Fit",
          "Crew Neck",
        ],
        sizes: ["S", "M", "L", "XL"],
        stockQuantity: 50,
      },
      {
        name: "Slim Fit Jeans",
        price: 49.99,
        category: "men",
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Modern slim fit jeans with stretch for maximum comfort.",
        details: [
          "98% Cotton, 2% Elastane",
          "Machine Washable",
          "Slim Fit",
          "Stretch Denim",
        ],
        sizes: ["28", "30", "32", "34"],
        stockQuantity: 30,
      },
      {
        name: "Summer Dress",
        price: 39.99,
        category: "women",
        rating: 5,
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Light and breezy summer dress perfect for warm weather.",
        details: [
          "100% Linen",
          "Hand Wash Recommended",
          "A-Line Fit",
          "Knee Length",
        ],
        sizes: ["XS", "S", "M", "L"],
        stockQuantity: 25,
      },
      {
        name: "Leather Jacket",
        price: 89.99,
        category: "men",
        rating: 4,
        image:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Genuine leather jacket with classic biker style.",
        details: [
          "100% Genuine Leather",
          "Dry Clean Only",
          "Regular Fit",
          "Zipper Closure",
        ],
        sizes: ["S", "M", "L", "XL"],
        stockQuantity: 15,
      },
      {
        name: "Sports Shoes",
        price: 79.99,
        category: "shoes",
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "High-performance sports shoes for running and training.",
        details: [
          "Breathable Mesh",
          "Rubber Sole",
          "Cushioned Insole",
          "Lace-up Closure",
        ],
        sizes: ["7", "8", "9", "10", "11"],
        stockQuantity: 40,
      },
      {
        name: "Winter Jacket",
        price: 129.99,
        category: "women",
        rating: 4,
        image:
          "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Warm and stylish winter jacket with waterproof coating.",
        details: [
          "Waterproof Coating",
          "Faux Fur Hood",
          "Multiple Pockets",
          "Regular Fit",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        stockQuantity: 20,
      },
      {
        name: "Designer Handbag",
        price: 199.99,
        category: "accessories",
        rating: 5,
        image:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Luxurious designer handbag with premium craftsmanship.",
        details: [
          "Genuine Leather",
          "Gold-tone Hardware",
          "Adjustable Strap",
          "Multiple Compartments",
        ],
        sizes: ["One Size"],
        stockQuantity: 10,
      },
      {
        name: "Smart Watch",
        price: 249.99,
        category: "electronics",
        rating: 4.5,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        description: "Advanced smartwatch with health monitoring features.",
        details: [
          "Heart Rate Monitor",
          "GPS Tracking",
          "Water Resistant",
          "7-day Battery",
        ],
        sizes: ["Small", "Medium", "Large"],
        stockQuantity: 35,
      },
    ];

    await Product.insertMany(products);
    res.json({ message: "Products seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
