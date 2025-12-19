const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Product = require("./models/Product");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = require("./config/database");
connectDB();

// Seed initial products if database is empty
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
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
          description:
            "Modern slim fit jeans with stretch for maximum comfort.",
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
          description:
            "Light and breezy summer dress perfect for warm weather.",
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
          description:
            "High-performance sports shoes for running and training.",
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
          description:
            "Warm and stylish winter jacket with waterproof coating.",
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
      console.log("Initial products seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

// Seed products after DB connection
mongoose.connection.once("open", () => {
  seedProducts();
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
