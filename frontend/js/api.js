// API utility functions
const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("token");
    this.isValidating = false;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("API Request:", url, options);

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log("Making request to:", url);
      const response = await fetch(url, config);
      console.log("Response status:", response.status, response.statusText);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async login(credentials) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    // Prevent multiple simultaneous validation requests
    if (this.isValidating) {
      console.log("getCurrentUser: Already validating, waiting...");
      while (this.isValidating) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    this.isValidating = true;
    try {
      return await this.request("/auth/me");
    } finally {
      this.isValidating = false;
    }
  }

  async updateProfile(userData) {
    return await this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return await this.request("/products/featured/home");
  }

  async seedProducts() {
    return await this.request("/products/seed", { method: "POST" });
  }

  // Cart methods
  async getCart() {
    return await this.request("/cart");
  }

  async addToCart(productId, quantity = 1) {
    return await this.request("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId, quantity) {
    return await this.request(`/cart/update/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId) {
    return await this.request(`/cart/remove/${productId}`, {
      method: "DELETE",
    });
  }

  async clearCart() {
    return await this.request("/cart/clear", { method: "DELETE" });
  }

  // Wishlist methods
  async getWishlist() {
    return await this.request("/wishlist");
  }

  async addToWishlist(productId) {
    return await this.request(`/wishlist/add/${productId}`, { method: "POST" });
  }

  async removeFromWishlist(productId) {
    return await this.request(`/wishlist/remove/${productId}`, {
      method: "DELETE",
    });
  }

  async checkWishlist(productId) {
    return await this.request(`/wishlist/check/${productId}`);
  }

  // Order methods
  async getOrders() {
    return await this.request("/orders");
  }

  async getOrder(id) {
    return await this.request(`/orders/${id}`);
  }

  async createOrder(orderData) {
    return await this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(orderId) {
    return await this.request(`/orders/${orderId}/cancel`, { method: "PUT" });
  }
}

// Create global API instance
const api = new ApiService();
