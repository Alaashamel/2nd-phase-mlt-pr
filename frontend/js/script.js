// Enhanced JavaScript with Auth System, Toast, and API Integration
let currentUser = null;
let cartData = { items: [], totalItems: 0, totalPrice: 0 };
let wishlistData = { items: [] };
let isInitializing = false;

// Initialize app
async function initializeApp() {
  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log("initializeApp: Already initializing, skipping");
    return;
  }

  isInitializing = true;
  console.log("initializeApp: Starting app initialization");
  try {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    console.log(
      "initializeApp: Token from localStorage:",
      token ? "exists" : "null"
    );

    if (token) {
      api.setToken(token);
      console.log("initializeApp: Calling api.getCurrentUser");
      const userData = await api.getCurrentUser();
      console.log("initializeApp: getCurrentUser response:", userData);
      currentUser = userData.user;
      console.log("initializeApp: currentUser set to:", currentUser);

      // Load cart and wishlist data
      await loadCartData();
      await loadWishlistData();
    } else {
      console.log("initializeApp: No token found, user not logged in");
      currentUser = null;
    }
  } catch (error) {
    console.error("initializeApp: Error initializing app:", error);
    // Only clear token if it's invalid (401), not on network issues
    if (
      error.message &&
      (error.message.includes("401") ||
        error.message.includes("Invalid token") ||
        error.message.includes("No token provided"))
    ) {
      localStorage.removeItem("token");
      api.setToken(null);
      console.log("initializeApp: Token invalid, cleared");
    } else {
      console.log("initializeApp: API error (possibly network), keeping token");
    }
    currentUser = null;
    console.log("initializeApp: currentUser set to null due to error");
  }

  console.log("initializeApp: Calling updateUserInterface");
  updateUserInterface();
  if (currentUser) {
    console.log("initializeApp: Calling updateUserDataInDOM");
    updateUserDataInDOM();
  } else {
    console.log(
      "initializeApp: No current user, checking localStorage token again"
    );
    const token = localStorage.getItem("token");
    console.log("initializeApp: Final token check:", token ? "exists" : "null");
  }
  updateCartCount();
  updateWishlistCount();
  console.log("initializeApp: Initialization complete");
  isInitializing = false;
}

// Toast System
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Auth System
function showAuthModal() {
  document.getElementById("auth-modal").style.display = "block";
}

function hideAuthModal() {
  document.getElementById("auth-modal").style.display = "none";
}

function switchAuthTab(tabName) {
  document
    .querySelectorAll(".auth-form")
    .forEach((form) => form.classList.remove("active"));
  document
    .querySelectorAll(".auth-tab")
    .forEach((tab) => tab.classList.remove("active"));

  document.getElementById(`${tabName}-form`).classList.add("active");
  document
    .querySelector(`[onclick="switchAuthTab('${tabName}')"]`)
    .classList.add("active");
}

async function register(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };
  console.log("register: form userData =", userData);

  try {
    const data = await api.register(userData);
    console.log("register: API response data.user =", data.user);
    currentUser = data.user;
    console.log("register: currentUser set to =", currentUser);

    // Update user interface and data immediately
    updateUserInterface();
    updateUserDataInDOM();
    hideAuthModal();
    showToast(`Welcome, ${currentUser.name}!`);
    event.target.reset();

    // Load user data
    await loadCartData();
    await loadWishlistData();

    // Force update user profile visibility one more time
    const userProfile = document.querySelector(".user-profile");
    if (userProfile && currentUser) {
      userProfile.classList.add("active");
      userProfile.style.display = "flex";
      console.log("register: Force updated user profile visibility");
    }
  } catch (error) {
    showToast(error.message || "Registration failed", "error");
  }
}

async function login(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const data = await api.login(credentials);
    console.log("login: API response data.user =", data.user);
    currentUser = data.user;
    console.log("login: currentUser set to =", currentUser);

    // Update user interface and data immediately
    updateUserInterface();
    updateUserDataInDOM();
    hideAuthModal();
    showToast(`Welcome back, ${currentUser.name}!`);
    event.target.reset();

    // Load user data
    await loadCartData();
    await loadWishlistData();

    // Force update user profile visibility one more time
    const userProfile = document.querySelector(".user-profile");
    if (userProfile && currentUser) {
      userProfile.classList.add("active");
      userProfile.style.display = "flex";
      console.log("login: Force updated user profile visibility");
    }
  } catch (error) {
    showToast(error.message || "Login failed", "error");
  }
}

function logout() {
  currentUser = null;
  cartData = { items: [], totalItems: 0, totalPrice: 0 };
  wishlistData = { items: [] };
  api.setToken(null);
  localStorage.removeItem("token");

  updateUserInterface();
  updateCartCount();
  updateWishlistCount();
  showToast("Logged out successfully!");
  hideUserDropdown();

  // Update UI immediately without page reload
  ensureLoginLinkExists();
}

// Load cart data from API
async function loadCartData() {
  if (!currentUser) return;
  try {
    const data = await api.getCart();
    cartData = data;
  } catch (error) {
    console.error("Error loading cart:", error);
    cartData = { items: [], totalItems: 0, totalPrice: 0 };
  }
}

// Load wishlist data from API
async function loadWishlistData() {
  console.log("loadWishlistData: currentUser =", !!currentUser);
  if (!currentUser) return;
  try {
    console.log("loadWishlistData: Calling api.getWishlist");
    const data = await api.getWishlist();
    console.log("loadWishlistData: API response data =", data);
    wishlistData = data;
    console.log("loadWishlistData: wishlistData set to =", wishlistData);
  } catch (error) {
    console.error("loadWishlistData: Error loading wishlist:", error);
    wishlistData = { items: [] };
    console.log("loadWishlistData: wishlistData reset to empty");
  }
}

function updateUserInterface() {
  console.log("updateUserInterface: currentUser =", currentUser);
  console.log("updateUserInterface: isInitializing =", isInitializing);

  // Always update UI, but skip during initialization only if we have a valid token
  const hasToken = !!localStorage.getItem("token");
  if (isInitializing && hasToken) {
    console.log(
      "updateUserInterface: Still initializing with valid token, skipping UI update"
    );
    return;
  }

  const userProfile = document.querySelector(".user-profile");
  const loginLinks = document.querySelectorAll(".login-link");
  const adminLink = document.querySelector(".admin-link");
  console.log("updateUserInterface: userProfile found =", !!userProfile);
  console.log("updateUserInterface: loginLinks found =", loginLinks.length);

  if (currentUser) {
    console.log(
      "updateUserInterface: User logged in, showing profile, removing login links"
    );
    if (userProfile) {
      userProfile.classList.add("active");
      userProfile.style.display = "flex";
      console.log("updateUserInterface: User profile shown");
    }
    // Remove ALL login links when user is logged in
    loginLinks.forEach((loginLink) => {
      if (loginLink.parentElement) {
        loginLink.parentElement.remove();
        console.log("updateUserInterface: Removed login link");
      }
    });
  } else {
    console.log("updateUserInterface: No user, hiding profile");
    if (userProfile) {
      userProfile.classList.remove("active");
      userProfile.style.display = "none";
    }
    // Always ensure login link exists when no user is logged in
    const token = localStorage.getItem("token");
    console.log(
      "updateUserInterface: Token check for login link:",
      token ? "has token" : "no token"
    );
    if (!token) {
      ensureLoginLinkExists();
    }
    // Show admin link if admin token exists
    const adminToken = localStorage.getItem("adminToken");
    if (adminLink) {
      adminLink.style.display = adminToken ? "block" : "none";
    }
  }
}

function ensureLoginLinkExists() {
  // Don't add login link if still initializing or if user is logged in
  if (isInitializing || currentUser) {
    console.log(
      "ensureLoginLinkExists: Skipping - initializing =",
      isInitializing,
      "currentUser =",
      !!currentUser
    );
    return;
  }

  const nav = document.querySelector("nav ul");
  const existingLoginLinks = document.querySelectorAll(".login-link");

  // Only add login link if none exists, user is not logged in, and we're not initializing
  if (
    nav &&
    existingLoginLinks.length === 0 &&
    !currentUser &&
    !isInitializing
  ) {
    console.log("ensureLoginLinkExists: Adding login link to nav");
    const loginLi = document.createElement("li");
    loginLi.innerHTML =
      '<a href="#" class="login-link" onclick="showAuthModal()">Login</a>';
    nav.appendChild(loginLi);
  }
}

function updateUserDataInDOM() {
  console.log("updateUserDataInDOM: currentUser =", currentUser);
  if (!currentUser) return;

  // Force show user profile
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    userProfile.classList.add("active");
    userProfile.style.display = "flex";
    console.log("updateUserDataInDOM: Force showed user profile");
  }

  // Update header user info
  const userAvatars = document.querySelectorAll(".user-avatar");
  const userNames = document.querySelectorAll(".user-name");
  const userEmails = document.querySelectorAll(".user-email");
  const profileAvatars = document.querySelectorAll(".profile-avatar");

  console.log(
    "updateUserDataInDOM: Found userAvatars:",
    userAvatars.length,
    "userNames:",
    userNames.length,
    "userEmails:",
    userEmails.length
  );

  userAvatars.forEach((avatar, index) => {
    console.log(
      "updateUserDataInDOM: Updating avatar",
      index,
      "to",
      currentUser.avatar
    );
    avatar.src = currentUser.avatar;
    avatar.alt = currentUser.name;
  });

  userNames.forEach((name, index) => {
    console.log(
      "updateUserDataInDOM: Updating name",
      index,
      "to",
      currentUser.name
    );
    name.textContent = currentUser.name;
  });

  userEmails.forEach((email, index) => {
    console.log(
      "updateUserDataInDOM: Updating email",
      index,
      "to",
      currentUser.email
    );
    email.textContent = currentUser.email;
  });

  profileAvatars.forEach((avatar) => {
    avatar.src = currentUser.avatar;
    avatar.alt = currentUser.name;
  });

  // Update profile page if exists
  const memberSince = document.querySelector(".member-since");
  if (memberSince) {
    const joinDate = new Date(currentUser.joinDate);
    memberSince.textContent = `Member since ${joinDate.toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric" }
    )}`;
  }
}

function toggleUserDropdown() {
  if (!currentUser) {
    showAuthModal();
    return;
  }
  const dropdown = document.querySelector(".user-dropdown");
  dropdown.classList.toggle("show");
}

function hideUserDropdown() {
  const dropdown = document.querySelector(".user-dropdown");
  if (dropdown) dropdown.classList.remove("show");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".user-profile")) {
    hideUserDropdown();
  }
});

// Cart functionality
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) cartCount.textContent = cartData.totalItems || 0;
}

function updateWishlistCount() {
  const wishlistCount = document.querySelector(".wishlist-count");
  if (wishlistCount)
    wishlistCount.textContent = wishlistData.items?.length || 0;
}

async function addToCart(productId, quantity = 1) {
  if (!currentUser) {
    showAuthModal();
    return false;
  }

  try {
    const data = await api.addToCart(productId, quantity);
    cartData = data.cart;
    updateCartCount();
    showToast("Product added to cart!");
    return true;
  } catch (error) {
    showToast(error.message || "Failed to add to cart", "error");
    return false;
  }
}

// Modal functionality
const cartIcon = document.querySelector(".cart-icon");
const modal = document.getElementById("cart-modal");
const closeBtn = document.querySelector(".close");
const checkoutBtn = document.getElementById("checkout-btn");

if (cartIcon) {
  cartIcon.addEventListener("click", function (e) {
    e.preventDefault();
    displayCartItems();
    modal.style.display = "block";
  });
}

if (closeBtn) {
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });
}

window.addEventListener("click", function (e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
  if (e.target.id === "auth-modal") {
    hideAuthModal();
  }
});

async function displayCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalPrice = document.getElementById("cart-total-price");

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (!cartData.items || cartData.items.length === 0) {
    cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";
    if (cartTotalPrice) cartTotalPrice.textContent = "0.00";
    return;
  }

  cartData.items.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.product.name}</h4>
                <p>$${item.product.price} x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="quantity-btn decrease" data-id="${item.product._id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.product._id}">+</button>
                <button class="remove-btn" data-id="${item.product._id}">Remove</button>
            </div>
        `;

    cartItemsContainer.appendChild(cartItem);
  });

  if (cartTotalPrice)
    cartTotalPrice.textContent = cartData.totalPrice?.toFixed(2) || "0.00";

  document.querySelectorAll(".decrease").forEach((button) => {
    button.addEventListener("click", async function () {
      const id = this.getAttribute("data-id");
      await updateCartQuantity(
        id,
        cartData.items.find((item) => item.product._id === id).quantity - 1
      );
    });
  });

  document.querySelectorAll(".increase").forEach((button) => {
    button.addEventListener("click", async function () {
      const id = this.getAttribute("data-id");
      await updateCartQuantity(
        id,
        cartData.items.find((item) => item.product._id === id).quantity + 1
      );
    });
  });

  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const id = this.getAttribute("data-id");
      await removeFromCart(id);
    });
  });
}

async function updateCartQuantity(productId, quantity) {
  try {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const data = await api.updateCartItem(productId, quantity);
    cartData = data.cart;
    updateCartCount();
    displayCartItems();
  } catch (error) {
    showToast(error.message || "Failed to update cart", "error");
  }
}

async function removeFromCart(productId) {
  try {
    const data = await api.removeFromCart(productId);
    cartData = data.cart;
    updateCartCount();
    displayCartItems();
    showToast("Item removed from cart!");
  } catch (error) {
    showToast(error.message || "Failed to remove item", "error");
  }
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async function () {
    if (!cartData.items || cartData.items.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!currentUser) {
      showAuthModal();
      return;
    }

    try {
      // Create order with basic shipping info (can be expanded)
      const orderData = {
        shippingAddress: {
          name: currentUser.name,
          email: currentUser.email,
          address: "Default Address", // In real app, get from form
          city: "Default City",
          zipCode: "00000",
          country: "Default Country",
        },
        paymentMethod: "card",
      };

      const data = await api.createOrder(orderData);
      showToast("Thank you for your purchase! Order placed successfully.");

      // Clear cart
      cartData = { items: [], totalItems: 0, totalPrice: 0 };
      updateCartCount();
      modal.style.display = "none";
    } catch (error) {
      showToast(error.message || "Failed to place order", "error");
    }
  });
}

// Wishlist functionality
async function toggleWishlist(productId) {
  console.log(
    "toggleWishlist: productId =",
    productId,
    "currentUser =",
    !!currentUser
  );
  if (!currentUser) {
    showAuthModal();
    return;
  }

  try {
    // Check if product is already in wishlist
    console.log("toggleWishlist: Checking if in wishlist");
    const data = await api.checkWishlist(productId);
    console.log("toggleWishlist: checkWishlist response =", data);
    if (data.inWishlist) {
      // Remove from wishlist
      console.log("toggleWishlist: Removing from wishlist");
      await api.removeFromWishlist(productId);
      showToast("Product removed from wishlist!");
    } else {
      // Add to wishlist
      console.log("toggleWishlist: Adding to wishlist");
      await api.addToWishlist(productId);
      showToast("Product added to wishlist!");
    }

    // Reload wishlist data
    console.log("toggleWishlist: Reloading wishlist data");
    await loadWishlistData();
    updateWishlistCount();

    // Update button state if on products page
    if (window.location.pathname.includes("products.html")) {
      const button = document.querySelector(
        `.wishlist-btn[onclick*="${productId}"]`
      );
      if (button) {
        const isInWishlist =
          wishlistData.items?.some((item) => item.product._id === productId) ||
          false;
        console.log(
          "toggleWishlist: Updating button class, isInWishlist =",
          isInWishlist
        );
        if (isInWishlist) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }
    }
  } catch (error) {
    console.error("toggleWishlist: Error:", error);
    showToast(error.message || "Failed to update wishlist", "error");
  }
}

// Enhanced wishlist functions with better error handling
async function removeFromWishlistSafe(productId) {
  try {
    if (!currentUser) {
      showToast("Please login to manage your wishlist", "error");
      return false;
    }

    await api.removeFromWishlist(productId);
    await loadWishlistData();
    updateWishlistCount();
    showToast("Product removed from wishlist!");
    return true;
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    showToast(error.message || "Failed to remove from wishlist", "error");
    return false;
  }
}

async function addToCartSafe(productId, quantity = 1) {
  try {
    if (!currentUser) {
      showToast("Please login to add items to cart", "error");
      return false;
    }

    const data = await api.addToCart(productId, quantity);
    cartData = data.cart;
    updateCartCount();
    showToast("Product added to cart!");
    return true;
  } catch (error) {
    console.error("Add to cart error:", error);
    showToast(error.message || "Failed to add to cart", "error");
    return false;
  }
}

// Initialize function that can be called from other scripts
async function initializeScript() {
  console.log(
    "initializeScript: Starting script initialization, currentUser =",
    currentUser,
    "isInitializing =",
    isInitializing
  );

  // Wait for initialization to complete if still in progress
  if (isInitializing) {
    console.log(
      "initializeScript: Waiting for app initialization to complete..."
    );
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  // Add event listeners to all add-to-cart buttons
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart")) {
      e.preventDefault();
      const productId = e.target.getAttribute("data-id");
      addToCart(productId, 1);
    }
  });
}

// Toggle menu function
function toggleMenu() {
  const menuItems = document.getElementById("menu-items");
  if (menuItems.style.maxHeight === "0px" || menuItems.style.maxHeight === "") {
    menuItems.style.maxHeight = "200px";
  } else {
    menuItems.style.maxHeight = "0px";
  }
}

// Initialize user profile visibility
document.addEventListener("DOMContentLoaded", function () {
  // Set initial state for user profile based on currentUser
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    console.log("DOM Content Loaded: currentUser =", currentUser);
    if (currentUser) {
      userProfile.classList.add("active");
      userProfile.style.display = "flex";
      console.log("User profile set to visible");
    } else {
      userProfile.classList.remove("active");
      userProfile.style.display = "none";
      console.log("User profile set to hidden");
    }
  } else {
    console.log("User profile element not found");
  }
});
