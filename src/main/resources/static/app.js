let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ADD PRODUCT
async function addProduct() {
    const product = {
        name: document.getElementById("name").value,
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value,
        quantity: Number(document.getElementById("quantity").value),
        imageUrl: document.getElementById("imageUrl").value
    };

    if (
        !product.name ||
        product.price <= 0 ||
        !product.category ||
        product.quantity <= 0 ||
        !product.imageUrl
    ) {
        alert("Please enter valid product details.");
        return;
    }

    const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });

    if (!response.ok) {
        alert("Failed to add product.");
        return;
    }

    alert("Product added successfully!");

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("imageUrl").value = "";

    loadProducts();
}

// LOAD PRODUCTS
async function loadProducts() {
    const response = await fetch("/api/products");

    if (!response.ok) {
        alert("Failed to load products.");
        return;
    }

    allProducts = await response.json();

    updateCategoryFilter();
    displayProducts(allProducts);
}

// CATEGORY FILTER
function updateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");
    const currentCategory = categoryFilter.value;

    const categories = [
        ...new Set(allProducts.map(product => product.category))
    ];

    categoryFilter.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = currentCategory;
}

// SEARCH AND FILTER
function filterProducts() {
    const searchText =
        document.getElementById("search").value.toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const filteredProducts = allProducts.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// DISPLAY PRODUCTS
function displayProducts(products) {
    const productsDiv = document.getElementById("products");
    productsDiv.innerHTML = "";

    if (products.length === 0) {
        productsDiv.innerHTML = "<p>No products found.</p>";
        return;
    }

    products.forEach(product => {
        const item = document.createElement("div");

        item.innerHTML = `
            <img
                src="${product.imageUrl}"
                alt="${product.name}"
                onerror="this.onerror=null;this.src='https://placehold.co/500x350?text=No+Image'"
            >

            <h3></h3>
            <p>Price: ₹${product.price}</p>
            <p>Category: </p>
            <p>Available Stock: ${product.quantity}</p>

            <label>Quantity:</label>
            <input
                type="number"
                id="buyQty-${product.id}"
                value="1"
                min="1"
                max="${product.quantity}"
            >

            <button onclick="addToCart(${product.id})">
                🛒 Add to Cart
            </button>

            <button onclick="updateProduct(${product.id})">
                Update
            </button>

            <button onclick="deleteProduct(${product.id})">
                Delete
            </button>
        `;

        item.querySelector("h3").textContent = product.name;
        item.querySelectorAll("p")[1].textContent =
            "Category: " + product.category;

        productsDiv.appendChild(item);
    });
}

// ADD TO CART
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);

    if (!product) {
        alert("Product not found.");
        return;
    }

    const quantityInput = document.getElementById("buyQty-" + productId);
    const quantity = Number(quantityInput.value);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > product.quantity
    ) {
        alert("Please select a valid quantity within available stock.");
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    const currentCartQuantity = existingItem ? existingItem.cartQuantity : 0;

    if (currentCartQuantity + quantity > product.quantity) {
        alert("You cannot add more than the available stock.");
        return;
    }

    if (existingItem) {
        existingItem.cartQuantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            cartQuantity: quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(product.name + " added to cart!");
    updateCartSummary();
}

// CART SUMMARY
function updateCartSummary() {
    const cartCount = cart.reduce(
        (total, item) => total + item.cartQuantity,
        0
    );

    const cartTotal = cart.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
    );

    const countElement = document.getElementById("cartCount");
    const totalElement = document.getElementById("cartTotal");

    if (countElement) {
        countElement.textContent = cartCount;
    }

    if (totalElement) {
        totalElement.textContent = "₹" + cartTotal.toFixed(2);
    }
}

// UPDATE PRODUCT
async function updateProduct(id) {
    const name = prompt("Enter new product name:");
    if (name === null || !name.trim()) return;

    const price = prompt("Enter new price:");
    if (price === null || Number(price) <= 0) return;

    const category = prompt("Enter new category:");
    if (category === null || !category.trim()) return;

    const quantity = prompt("Enter new stock quantity:");
    if (quantity === null || !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0) return;

    const imageUrl = prompt("Enter new image URL:");
    if (imageUrl === null || !imageUrl.trim()) return;

    const product = {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        quantity: Number(quantity),
        imageUrl: imageUrl.trim()
    };

    const response = await fetch("/api/products/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });

    if (!response.ok) {
        alert("Failed to update product.");
        return;
    }

    alert("Product updated successfully!");
    loadProducts();
}

// DELETE PRODUCT
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    const response = await fetch("/api/products/" + id, {
        method: "DELETE"
    });

    if (!response.ok) {
        alert("Failed to delete product.");
        return;
    }

    alert("Product deleted successfully!");
    loadProducts();
}

// INITIALIZE
loadProducts();
updateCartSummary();