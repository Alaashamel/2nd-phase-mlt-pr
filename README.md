# StyleShop - Full-Stack E-commerce Application

A modern, responsive e-commerce platform built with Node.js, Express, MongoDB, and vanilla JavaScript. StyleShop provides a seamless shopping experience with features like product browsing, user authentication, shopping cart, and wishlist functionality.

## 🚀 Features

- **Product Management**: Browse products by categories (Men's, Women's, Accessories)
- **User Authentication**: Secure login and registration system
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products for later
- **Responsive Design**: Mobile-first approach with modern UI
- **Admin Panel**: Admin dashboard for product management
- **Real-time Updates**: Dynamic content loading
- **Search & Filter**: Find products quickly
- **User Profile**: Manage account settings and order history

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Flexbox, Grid)
- **JavaScript (ES6+)** - Client-side logic
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 📦 Project Structure

```
styleshop/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── admin/
│   │   └── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── script.js
│   │   └── admin.js
│   ├── about.html
│   ├── cart.html
│   ├── contact.html
│   ├── index.html
│   ├── product-detail.html
│   ├── products.html
│   ├── profile.html
│   ├── wishlist.html
│   └── server.js
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/styleshop
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. For development, you can serve the frontend files using any static server:
```bash
# Using Node.js http-server
npx http-server

# Or using Python (if installed)
python -m http.server 8000

# Or using VS Code Live Server extension
```

3. Open your browser and navigate to the frontend URL (typically `http://localhost:8000`)

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `styleshop`
3. The application will automatically create the necessary collections

## 🚀 Deployment

### Backend Deployment (Heroku Example)
1. Create a Heroku app:
```bash
heroku create your-app-name-api
```

2. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_secret
heroku config:set MONGODB_URI=your_production_mongodb_uri
```

3. Deploy:
```bash
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Netlify/Vercel Example)
1. Build and deploy the frontend folder to your preferred platform
2. Configure the API endpoint in `frontend/js/api.js`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/featured` - Get featured products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user orders
- `PUT /api/orders/:id` - Update order status

## 🎨 UI Components

The frontend includes the following key pages:
- **Home Page** (`index.html`) - Landing page with featured products
- **Products** (`products.html`) - Product catalog with filters
- **Product Detail** (`product-detail.html`) - Individual product page
- **Cart** (`cart.html`) - Shopping cart management
- **Wishlist** (`wishlist.html`) - Saved products
- **Profile** (`profile.html`) - User account management
- **About** (`about.html`) - About page
- **Contact** (`contact.html`) - Contact information
- **Admin** (`admin/index.html`) - Admin dashboard

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🧪 Testing

To run tests (when implemented):
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: mostafa@example.com

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Unsplash for product images
- MongoDB community
- Node.js ecosystem

---

**StyleShop** - Making premium fashion accessible to everyone! 🛍️
