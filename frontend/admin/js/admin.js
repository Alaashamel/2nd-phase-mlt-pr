// Admin Panel JavaScript
class AdminPanel {
  constructor() {
    this.currentPage = "dashboard";
    this.currentUser = null;
    this.isLoggedIn = false;
    this.init();
  }

  init() {
    this.checkAdminAuth();
    this.setupEventListeners();
  }

  checkAdminAuth() {
    const token = localStorage.getItem("adminToken");
    if (token) {
      api.setToken(token);
      this.showAdminPanel();
      this.loadDashboardData();
    } else {
      this.showLoginModal();
    }
  }

  setupEventListeners() {
    // Admin Login
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleAdminLogin(e));
    }

    // Navigation
    document.querySelectorAll(".admin-nav-link").forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigation(e));
    });

    // Logout
    const logoutBtn = document.getElementById("admin-logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Menu Toggle
    const menuToggle = document.getElementById("admin-menu-toggle");
    if (menuToggle) {
      menuToggle.addEventListener("click", () => this.toggleSidebar());
    }

    // Notification Button
    const notificationBtn = document.querySelector(".admin-notification-btn");
    if (notificationBtn) {
      notificationBtn.addEventListener("click", () => this.showNotifications());
    }

    // Product Modal
    const addProductBtn = document.getElementById("add-product-btn");
    const quickAddBtn = document.querySelector(".admin-quick-add-btn");
    const productModal = document.getElementById("product-modal");
    const productModalClose = document.getElementById("product-modal-close");
    const productCancelBtn = document.getElementById("product-cancel-btn");

    if (addProductBtn)
      addProductBtn.addEventListener("click", () => this.openProductModal());
    if (quickAddBtn)
      quickAddBtn.addEventListener("click", () => this.openProductModal());
    if (productModalClose)
      productModalClose.addEventListener("click", () =>
        this.closeProductModal()
      );
    if (productCancelBtn)
      productCancelBtn.addEventListener("click", () =>
        this.closeProductModal()
      );

    // Product Form
    const productForm = document.getElementById("product-form");
    if (productForm) {
      productForm.addEventListener("submit", (e) =>
        this.handleProductSubmit(e)
      );
    }

    // Order Modal
    const orderModalClose = document.getElementById("order-modal-close");
    if (orderModalClose) {
      orderModalClose.addEventListener("click", () => this.closeOrderModal());
    }

    // Search and Filters
    const productSearch = document.getElementById("product-search");
    const productCategoryFilter = document.getElementById(
      "product-category-filter"
    );
    const orderSearch = document.getElementById("order-search");
    const orderStatusFilter = document.getElementById("order-status-filter");

    if (productSearch)
      productSearch.addEventListener("input", () => this.filterProducts());
    if (productCategoryFilter)
      productCategoryFilter.addEventListener("change", () =>
        this.filterProducts()
      );
    if (orderSearch)
      orderSearch.addEventListener("input", () => this.filterOrders());
    if (orderStatusFilter)
      orderStatusFilter.addEventListener("change", () => this.filterOrders());
  }

  // Authentication
  async handleAdminLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      // For demo purposes, accept any email/password combination
      // In production, this should authenticate against admin users
      if (credentials.email && credentials.password) {
        localStorage.setItem("adminToken", "admin-token-" + Date.now());
        this.showAdminPanel();
        this.loadDashboardData();
        this.showToast("Admin login successful!", "success");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      this.showLoginError(error.message || "Login failed");
    }
  }

  handleLogout() {
    localStorage.removeItem("adminToken");
    api.setToken(null);
    this.showLoginModal();
    this.showToast("Logged out successfully", "success");
  }

  showLoginModal() {
    document.getElementById("admin-login-modal").style.display = "flex";
    document.getElementById("admin-panel").style.display = "none";
  }

  showAdminPanel() {
    document.getElementById("admin-login-modal").style.display = "none";
    document.getElementById("admin-panel").style.display = "flex";
  }

  showLoginError(message) {
    const errorDiv = document.getElementById("admin-login-error");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }

  // Navigation
  handleNavigation(e) {
    e.preventDefault();
    const page = e.currentTarget.getAttribute("data-page");
    this.switchPage(page);
  }

  switchPage(page) {
    // Update navigation
    document.querySelectorAll(".admin-nav-link").forEach((link) => {
      link.classList.remove("active");
    });
    document.querySelector(`[data-page="${page}"]`).classList.add("active");

    // Update page title
    const pageTitles = {
      dashboard: "Dashboard",
      products: "Product Management",
      orders: "Order Management",
      users: "User Management",
      analytics: "Analytics & Reports",
      settings: "System Settings",
    };
    document.getElementById("admin-page-title").textContent =
      pageTitles[page] || "Admin Panel";

    // Hide all pages
    document.querySelectorAll(".admin-page").forEach((pageEl) => {
      pageEl.classList.remove("active");
    });

    // Show selected page
    document.getElementById(`${page}-page`).classList.add("active");

    // Load page data
    this.loadPageData(page);
  }

  toggleSidebar() {
    const sidebar = document.querySelector(".admin-sidebar");
    sidebar.classList.toggle("collapsed");
  }

  showNotifications() {
    // Sample notifications for demo
    const notifications = [
      {
        message: "New order received from customer",
        time: "2 minutes ago",
        type: "order",
      },
      {
        message: "Product stock running low",
        time: "1 hour ago",
        type: "warning",
      },
      {
        message: "Weekly sales report is ready",
        time: "3 hours ago",
        type: "info",
      },
    ];

    // Create notification dropdown
    const notificationDropdown = document.createElement("div");
    notificationDropdown.className = "notification-dropdown";
    notificationDropdown.innerHTML = `
      <div class="notification-header">
        <h4>Notifications</h4>
        <button class="mark-all-read">Mark all read</button>
      </div>
      <div class="notification-list">
        ${notifications
          .map(
            (notification) => `
          <div class="notification-item ${notification.type}">
            <div class="notification-content">
              <p>${notification.message}</p>
              <span class="notification-time">${notification.time}</span>
            </div>
            <div class="notification-actions">
              <button class="notification-close" onclick="this.closest('.notification-item').remove()">×</button>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Position and show dropdown
    const notificationBtn = document.querySelector(".admin-notification-btn");
    const rect = notificationBtn.getBoundingClientRect();
    notificationDropdown.style.position = "fixed";
    notificationDropdown.style.top = `${rect.bottom + 5}px`;
    notificationDropdown.style.right = `${window.innerWidth - rect.right}px`;
    notificationDropdown.style.zIndex = "1000";

    // Remove existing dropdown if any
    const existing = document.querySelector(".notification-dropdown");
    if (existing) existing.remove();

    document.body.appendChild(notificationDropdown);

    // Close when clicking outside
    setTimeout(() => {
      document.addEventListener("click", function closeDropdown(e) {
        if (
          !notificationDropdown.contains(e.target) &&
          e.target !== notificationBtn
        ) {
          notificationDropdown.remove();
          document.removeEventListener("click", closeDropdown);
        }
      });
    }, 100);

    // Mark all read functionality
    const markAllReadBtn = notificationDropdown.querySelector(".mark-all-read");
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", () => {
        document.querySelectorAll(".notification-item").forEach((item) => {
          item.classList.add("read");
        });
        // Reset notification badge
        const badge = document.querySelector(".notification-badge");
        if (badge) badge.style.display = "none";
        this.showToast("All notifications marked as read", "success");
      });
    }
  }

  // Dashboard
  async loadDashboardData() {
    try {
      // Load stats
      await this.loadDashboardStats();

      // Load recent orders
      await this.loadRecentOrders();

      // Load products count
      await this.loadProductsCount();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  async loadDashboardStats() {
    try {
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const stats = await response.json();

      document.getElementById("total-orders").textContent =
        stats.totalOrders || 0;
      document.getElementById("total-revenue").textContent = `$${
        stats.totalRevenue?.toFixed(2) || "0.00"
      }`;
      document.getElementById("total-users").textContent =
        stats.totalUsers || 0;
      document.getElementById("total-products").textContent =
        stats.totalProducts || 0;
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    }
  }

  async loadRecentOrders() {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();

      const tbody = document.getElementById("recent-orders-body");
      tbody.innerHTML = "";

      if (data.orders && data.orders.length > 0) {
        const recentOrders = data.orders.slice(0, 5);
        recentOrders.forEach((order) => {
          const row = `
                         <tr>
                             <td>#${order._id.slice(-8)}</td>
                             <td>${order.user?.name || "N/A"}</td>
                             <td><span class="status-badge status-${
                               order.status
                             }">${order.status}</span></td>
                             <td>$${order.total.toFixed(2)}</td>
                             <td>${new Date(
                               order.createdAt
                             ).toLocaleDateString()}</td>
                             <td>
                                 <button class="action-btn view" onclick="adminPanel.viewOrder('${
                                   order._id
                                 }')">
                                     <i class="fas fa-eye"></i>
                                 </button>
                             </td>
                         </tr>
                     `;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML =
          '<tr><td colspan="6" style="text-align: center;">No orders found</td></tr>';
      }
    } catch (error) {
      console.error("Error loading recent orders:", error);
    }
  }

  async loadProductsCount() {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      document.getElementById("total-products").textContent =
        data.products?.length || 0;
    } catch (error) {
      console.error("Error loading products count:", error);
    }
  }

  async loadAnalytics() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/analytics",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      const data = await response.json();

      // Update sales chart (simplified - just show data)
      const salesData = data.salesData || [];
      const popularProducts = data.popularProducts || [];

      // Display sales data
      const salesContainer = document.getElementById("sales-data");
      if (salesContainer) {
        salesContainer.innerHTML = salesData
          .map(
            (item) => `
          <div class="analytics-item">
            <span>${item._id}</span>
            <span>${item.count} orders</span>
            <span>$${item.total.toFixed(2)}</span>
          </div>
        `
          )
          .join("");
      }

      // Display popular products
      const productsContainer = document.getElementById("popular-products");
      if (productsContainer) {
        productsContainer.innerHTML = popularProducts
          .map(
            (product) => `
          <div class="analytics-item">
            <span>${product.name}</span>
            <span>${product.totalSold} sold</span>
            <span>$${product.totalRevenue.toFixed(2)}</span>
          </div>
        `
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      this.showToast("Failed to load analytics", "error");
    }
  }

  // Products Management
  async loadPageData(page) {
    switch (page) {
      case "dashboard":
        await this.loadDashboardData();
        break;
      case "products":
        await this.loadProducts();
        break;
      case "orders":
        await this.loadOrders();
        break;
      case "users":
        await this.loadUsers();
        break;
      case "analytics":
        await this.loadAnalytics();
        break;
    }
  }

  async loadProducts() {
    try {
      const response = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();

      const tbody = document.getElementById("products-table-body");
      tbody.innerHTML = "";

      if (data.products && data.products.length > 0) {
        data.products.forEach((product) => {
          const row = `
                         <tr>
                             <td><img src="${product.image}" alt="${
            product.name
          }"></td>
                             <td>${product.name}</td>
                             <td>${product.category}</td>
                             <td>$${product.price}</td>
                             <td>${product.stockQuantity || 0}</td>
                             <td><span class="status-badge ${
                               product.inStock
                                 ? "status-delivered"
                                 : "status-cancelled"
                             }">${
            product.inStock ? "In Stock" : "Out of Stock"
          }</span></td>
                             <td>
                                 <button class="action-btn edit" onclick="adminPanel.editProduct('${
                                   product._id
                                 }')">
                                     <i class="fas fa-edit"></i>
                                 </button>
                                 <button class="action-btn delete" onclick="adminPanel.deleteProduct('${
                                   product._id
                                 }')">
                                     <i class="fas fa-trash"></i>
                                 </button>
                             </td>
                         </tr>
                     `;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML =
          '<tr><td colspan="7" style="text-align: center;">No products found</td></tr>';
      }
    } catch (error) {
      console.error("Error loading products:", error);
      this.showToast("Failed to load products", "error");
    }
  }

  async loadOrders() {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();

      const tbody = document.getElementById("orders-table-body");
      tbody.innerHTML = "";

      if (data.orders && data.orders.length > 0) {
        data.orders.forEach((order) => {
          const row = `
                         <tr>
                             <td>#${order._id.slice(-8)}</td>
                             <td>${order.user?.name || "N/A"}</td>
                             <td>${order.items?.length || 0} items</td>
                             <td>$${order.total.toFixed(2)}</td>
                             <td><span class="status-badge status-${
                               order.status
                             }">${order.status}</span></td>
                             <td>${new Date(
                               order.createdAt
                             ).toLocaleDateString()}</td>
                             <td>
                                 <button class="action-btn view" onclick="adminPanel.viewOrder('${
                                   order._id
                                 }')">
                                     <i class="fas fa-eye"></i>
                                 </button>
                                 <button class="action-btn edit" onclick="adminPanel.updateOrderStatus('${
                                   order._id
                                 }', '${order.status}')">
                                     <i class="fas fa-edit"></i>
                                 </button>
                             </td>
                         </tr>
                     `;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML =
          '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      this.showToast("Failed to load orders", "error");
    }
  }

  async loadUsers() {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();

      const tbody = document.getElementById("users-table-body");
      tbody.innerHTML = "";

      if (data.users && data.users.length > 0) {
        data.users.forEach((user) => {
          const row = `
                         <tr>
                             <td><img src="${user.avatar}" alt="${
            user.name
          }" style="width: 40px; height: 40px; border-radius: 50%;"></td>
                             <td>${user.name}</td>
                             <td>${user.email}</td>
                             <td>${new Date(
                               user.createdAt
                             ).toLocaleDateString()}</td>
                             <td>0</td>
                             <td><span class="status-badge status-delivered">Active</span></td>
                             <td>
                                 <button class="action-btn edit" onclick="adminPanel.editUser('${
                                   user._id
                                 }')">
                                     <i class="fas fa-edit"></i>
                                 </button>
                             </td>
                         </tr>
                     `;
          tbody.innerHTML += row;
        });
      } else {
        tbody.innerHTML =
          '<tr><td colspan="7" style="text-align: center;">No users found</td></tr>';
      }
    } catch (error) {
      console.error("Error loading users:", error);
      this.showToast("Failed to load users", "error");
    }
  }

  // Product Modal
  openProductModal(productId = null) {
    const modal = document.getElementById("product-modal");
    const form = document.getElementById("product-form");
    const title = document.getElementById("product-modal-title");

    if (productId) {
      title.textContent = "Edit Product";
      // Load product data (would need API endpoint)
      this.loadProductForEdit(productId);
    } else {
      title.textContent = "Add New Product";
      form.reset();
    }

    modal.classList.add("active");
  }

  closeProductModal() {
    const modal = document.getElementById("product-modal");
    modal.classList.remove("active");
  }

  async handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      price: parseFloat(formData.get("price")),
      image: formData.get("image"),
      description: formData.get("description"),
      stockQuantity: parseInt(formData.get("stockQuantity")) || 0,
      details: formData.get("details")
        ? formData
            .get("details")
            .split("\n")
            .filter((item) => item.trim())
        : [],
      sizes: formData.get("sizes")
        ? formData
            .get("sizes")
            .split(",")
            .map((s) => s.trim())
        : [],
    };

    try {
      const productId = formData.get("productId");
      let response;

      if (productId) {
        // Update product
        response = await fetch(
          `http://localhost:5000/api/admin/products/${productId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
            body: JSON.stringify(productData),
          }
        );
      } else {
        // Create product
        response = await fetch("http://localhost:5000/api/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        this.closeProductModal();
        this.loadProducts();
        this.showToast(
          `Product ${productId ? "updated" : "created"} successfully!`,
          "success"
        );
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      this.showToast("Failed to save product", "error");
    }
  }

  // Order Modal
  async viewOrder(orderId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      const data = await response.json();

      if (data.order) {
        const modal = document.getElementById("order-modal");
        const content = document.getElementById("order-details-content");

        content.innerHTML = `
                    <div class="order-details">
                        <div class="order-header">
                            <h3>Order #${data.order._id.slice(-8)}</h3>
                            <span class="status-badge status-${
                              data.order.status
                            }">${data.order.status}</span>
                        </div>
                        <div class="order-info">
                            <div class="info-section">
                                <h4>Customer Information</h4>
                                <p><strong>Name:</strong> ${
                                  data.order.user?.name || "N/A"
                                }</p>
                                <p><strong>Email:</strong> ${
                                  data.order.user?.email || "N/A"
                                }</p>
                            </div>
                            <div class="info-section">
                                <h4>Order Summary</h4>
                                <p><strong>Total:</strong> $${data.order.total.toFixed(
                                  2
                                )}</p>
                                <p><strong>Date:</strong> ${new Date(
                                  data.order.createdAt
                                ).toLocaleString()}</p>
                            </div>
                        </div>
                        <div class="order-items">
                            <h4>Items</h4>
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${data.order.items
                                      .map(
                                        (item) => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td>$${item.price.toFixed(2)}</td>
                                            <td>${item.quantity}</td>
                                            <td>$${(
                                              item.price * item.quantity
                                            ).toFixed(2)}</td>
                                        </tr>
                                    `
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;

        modal.classList.add("active");
      }
    } catch (error) {
      console.error("Error loading order details:", error);
      this.showToast("Failed to load order details", "error");
    }
  }

  closeOrderModal() {
    const modal = document.getElementById("order-modal");
    modal.classList.remove("active");
  }

  // Utility Methods
  showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  filterProducts() {
    const searchTerm = document
      .getElementById("product-search")
      .value.toLowerCase();
    const categoryFilter = document.getElementById(
      "product-category-filter"
    ).value;

    const rows = document.querySelectorAll("#products-table-body tr");
    rows.forEach((row) => {
      const name = row.cells[1].textContent.toLowerCase();
      const category = row.cells[2].textContent;

      const matchesSearch = name.includes(searchTerm);
      const matchesCategory = !categoryFilter || category === categoryFilter;

      row.style.display = matchesSearch && matchesCategory ? "" : "none";
    });
  }

  filterOrders() {
    const searchTerm = document
      .getElementById("order-search")
      .value.toLowerCase();
    const statusFilter = document.getElementById("order-status-filter").value;

    const rows = document.querySelectorAll("#orders-table-body tr");
    rows.forEach((row) => {
      const orderId = row.cells[0].textContent.toLowerCase();
      const customer = row.cells[1].textContent.toLowerCase();
      const status = row.cells[4].textContent.toLowerCase();

      const matchesSearch =
        orderId.includes(searchTerm) || customer.includes(searchTerm);
      const matchesStatus = !statusFilter || status.includes(statusFilter);

      row.style.display = matchesSearch && matchesStatus ? "" : "none";
    });
  }

  // Product management
  async editProduct(productId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      const data = await response.json();

      if (data.product) {
        this.populateProductForm(data.product);
        this.openProductModal(productId);
      }
    } catch (error) {
      console.error("Error loading product for edit:", error);
      this.showToast("Failed to load product details", "error");
    }
  }

  async deleteProduct(productId) {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.ok) {
        this.loadProducts();
        this.showToast("Product deleted successfully!", "success");
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      this.showToast("Failed to delete product", "error");
    }
  }

  populateProductForm(product) {
    document.getElementById("product-id").value = product._id || "";
    document.getElementById("product-name").value = product.name || "";
    document.getElementById("product-category").value = product.category || "";
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-image").value = product.image || "";
    document.getElementById("product-description").value =
      product.description || "";
    document.getElementById("product-stock").value =
      product.stockQuantity || "";
    document.getElementById("product-details").value = product.details
      ? product.details.join("\n")
      : "";
    document.getElementById("product-sizes").value = product.sizes
      ? product.sizes.join(", ")
      : "";
  }

  // Order management
  async updateOrderStatus(orderId, currentStatus) {
    const newStatus = prompt(
      `Update order status (current: ${currentStatus}). Enter new status:`,
      currentStatus
    );
    if (!newStatus || newStatus === currentStatus) return;

    const validStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
      this.showToast(
        "Invalid status. Use: processing, shipped, delivered, cancelled",
        "error"
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        this.loadOrders();
        this.showToast(`Order status updated to ${newStatus}!`, "success");
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      this.showToast("Failed to update order status", "error");
    }
  }

  loadProductForEdit(productId) {
    // This method is called from openProductModal when editing
    // The actual loading is done in editProduct method above
  }
}

// Initialize admin panel
const adminPanel = new AdminPanel();
