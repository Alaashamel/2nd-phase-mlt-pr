// Products page functionality
let allProducts = [];
let filteredProducts = [];
let currentCategory = "all";
let currentSort = "default";
let currentPage = 1;
const productsPerPage = 8;

async function loadProducts(params = {}) {
  try {
    const data = await api.getProducts(params);
    return data;
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("Failed to load products", "error");
    return { products: [], pagination: { totalPages: 0, currentPage: 1 } };
  }
}

function renderProducts(productsToRender) {
  const container = document.getElementById("products-container");
  if (!container) return;

  container.innerHTML = "";

  if (!productsToRender || productsToRender.length === 0) {
    container.innerHTML = `
            <div class="col-12" style="text-align: center; padding: 50px;">
              <i class="fas fa-search" style="font-size: 60px; color: #ddd; margin-bottom: 20px;"></i>
              <h3>No products found</h3>
              <p>Try adjusting your filters to see more products.</p>
              <button class="btn" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
    return;
  }

  productsToRender.forEach((product) => {
    const ratingStars = generateRatingStars(product.rating);
    const isInWishlist = checkIfInWishlist(product._id);

    const productHTML = `
            <div class="col-4">
              <div class="product-card">
                  <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}">
                    <button class="wishlist-btn ${isInWishlist ? "active" : ""}"
                          onclick="toggleWishlist('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                  </div>
                  <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="rating">
                        ${ratingStars}
                    </div>
                    <p class="price">$${product.price}</p>
                    <button class="add-to-cart"
                          data-id="${product._id}"
                          data-name="${product.name}"
                          data-price="${product.price}">
                        Add to Cart
                    </button>
                    <a href="product-detail.html?id=${
                      product._id
                    }" class="btn-secondary" style="display: block; text-align: center; margin-top: 10px;">View Details</a>
                  </div>
              </div>
            </div>
        `;

    container.innerHTML += productHTML;
  });

  // Add event listeners to Add to Cart buttons
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const productId = this.getAttribute("data-id");
      await addToCart(productId, 1);
    });
  });
}

function generateRatingStars(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

async function applyFilters() {
  const priceRange = parseInt(document.getElementById("price-range").value);
  const selectedBrands = Array.from(
    document.querySelectorAll(".brand-filter input:checked")
  ).map((input) => input.value);

  const params = {
    category: currentCategory !== "all" ? currentCategory : undefined,
    maxPrice: priceRange,
    sort: currentSort,
    page: currentPage,
    limit: productsPerPage,
  };

  // Remove undefined values
  Object.keys(params).forEach(
    (key) => params[key] === undefined && delete params[key]
  );

  const data = await loadProducts(params);
  filteredProducts = data.products;

  // Update products count
  const countElement = document.getElementById("products-count");
  if (countElement) {
    const total = data.pagination.totalProducts || 0;
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, total);
    countElement.textContent = `Showing ${start}-${end} of ${total} products`;
  }

  renderProducts(filteredProducts);

  // Update pagination
  updatePagination(data.pagination);
}

function clearFilters() {
  document.getElementById("price-range").value = 250;
  document.querySelector(".price-values span:last-child").textContent = "$250";
  document.querySelectorAll(".brand-filter input").forEach((checkbox) => {
    checkbox.checked = false;
  });
  document
    .querySelectorAll(".categories-list a")
    .forEach((a) => a.classList.remove("active"));
  document
    .querySelector('.categories-list a[data-category="all"]')
    .classList.add("active");
  currentCategory = "all";
  currentSort = "default";
  currentPage = 1;
  document.querySelector(".sort-select").value = "default";

  applyFilters();
}

function sortProducts() {
  currentSort = document.querySelector(".sort-select").value;
  currentPage = 1;
  applyFilters();
}

function changePage(page) {
  currentPage = page;
  applyFilters();
  // Scroll to top of products section
  document
    .querySelector(".products-grid")
    .scrollIntoView({ behavior: "smooth" });
}

function updatePagination(pagination) {
  const paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) return;

  if (pagination.totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Previous button
  if (pagination.currentPage > 1) {
    paginationHTML += `<a href="#" class="page-btn" onclick="changePage(${
      pagination.currentPage - 1
    })">← Previous</a>`;
  }

  // Page numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === pagination.currentPage) {
      paginationHTML += `<a href="#" class="page-btn active">${i}</a>`;
    } else {
      paginationHTML += `<a href="#" class="page-btn" onclick="changePage(${i})">${i}</a>`;
    }
  }

  // Next button
  if (pagination.currentPage < pagination.totalPages) {
    paginationHTML += `<a href="#" class="page-btn" onclick="changePage(${
      pagination.currentPage + 1
    })">Next →</a>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

function checkIfInWishlist(productId) {
  if (!currentUser) return false;
  return (
    wishlistData.items?.some((item) => item.product._id === productId) || false
  );
}

// Initialize products page function
async function initializeProductsPage() {
  // Load initial products
  await applyFilters();

  // Category filter
  document.querySelectorAll(".categories-list a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".categories-list a")
        .forEach((a) => a.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.getAttribute("data-category");
      currentPage = 1;
      applyFilters();
    });
  });

  // Price filter
  document.getElementById("price-range").addEventListener("input", function () {
    document.querySelector(
      ".price-values span:last-child"
    ).textContent = `$${this.value}`;
    currentPage = 1;
    applyFilters();
  });

  // Brand filter
  document.querySelectorAll(".brand-filter input").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      currentPage = 1;
      applyFilters();
    });
  });

  // Sort select
  document
    .querySelector(".sort-select")
    .addEventListener("change", sortProducts);

  // Apply filters button
  document.querySelector(".filter-btn").addEventListener("click", applyFilters);
}
