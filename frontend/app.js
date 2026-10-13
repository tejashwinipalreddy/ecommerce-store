// BACKEND API
const API_URL = "https://ecommerce-store-hui4.onrender.com/api/products";

// GLOBAL VARIABLES
let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// HELPER: HANDLE API ERRORS
async function handleResponse(response) {
    if (!response.ok) {
        const message = await response.text();
        throw new Error(
            message || `Request failed: ${response.status}`
        );
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }

    return null;
}

// ADD PRODUCT
async function addProduct() {
    const product = {
        name: document.getElementById("name").value.trim(),
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value.trim(),
        quantity: Number(document.getElementById("quantity").value),
        imageUrl: document.getElementById("imageUrl").value.trim()
    };

    if (
        !product.name ||
        !Number.isFinite(product.price) ||
        product.price <= 0 ||
        !product.category ||
        !Number.isInteger(product.quantity) ||
        product.quantity <= 0 ||
        !product.imageUrl
    ) {
        alert("Please enter valid product details.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        await handleResponse(response);

        alert("Product added successfully!");

        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("category").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("imageUrl").value = "";

        await loadProducts();
    } catch (error) {
        console.error("Add product error:", error);
        alert(
            "Failed to add product. Check that the backend is running " +
            "and its API allows requests from this page."
        );
    }
}

// LOAD PRODUCTS
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await handleResponse(response);

        allProducts = Array.isArray(data) ? data : [];

        updateCategoryFilter();
        displayProducts(allProducts);
    } catch (error) {
        console.error("Load products error:", error);

        const productsDiv = document.getElementById("products");

        if (productsDiv) {
            productsDiv.textContent =
                "Unable to load products. Make sure the backend is running.";
        }
    }
}

// CATEGORY FILTER
function updateCategoryFilter() {
    const categoryFilter = document.getElementById("categoryFilter");

    if (!categoryFilter) return;

    const currentCategory = categoryFilter.value;

    const categories = [
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];

    categoryFilter.innerHTML =
        '<option value="">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = categories.includes(currentCategory)
        ? currentCategory
        : "";
}

// SEARCH AND FILTER
function filterProducts() {
    const searchElement = document.getElementById("search");
    const categoryElement = document.getElementById("categoryFilter");

    const searchText = searchElement
        ? searchElement.value.toLowerCase().trim()
        : "";

    const selectedCategory = categoryElement
        ? categoryElement.value
        : "";

    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = (product.name || "")
            .toLowerCase()
            .includes(searchText);

        const matchesCategory =
            !selectedCategory ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}

// DISPLAY PRODUCTS
function displayProducts(products) {
    const productsDiv = document.getElementById("products");

    if (!productsDiv) return;

    productsDiv.innerHTML = "";

    if (!products.length) {
        productsDiv.textContent = "No products found.";
        return;
    }

    products.forEach(product => {
        const item = document.createElement("div");
        item.className = "product-card";

        const image = document.createElement("img");
        image.src = product.imageUrl || "";
        image.alt = product.name || "Product";
        image.onerror = function () {
            this.onerror = null;
            this.src =
                "https://placehold.co/500x350?text=No+Image";
        };

        const name = document.createElement("h3");
        name.textContent = product.name || "Unnamed product";

        const price = document.createElement("p");
        price.textContent =
            "Price: ₹" + Number(product.price || 0).toFixed(2);

        const category = document.createElement("p");
        category.textContent =
            "Category: " + (product.category || "Uncategorized");

        const stock = document.createElement("p");
        stock.textContent =
            "Available Stock: " + Number(product.quantity || 0);

        const quantityLabel = document.createElement("label");
        quantityLabel.textContent = "Quantity: ";

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.id = "buyQty-" + product.id;
        quantityInput.value = "1";
        quantityInput.min = "1";
        quantityInput.max = String(
            Math.max(1, Number(product.quantity || 0))
        );

        const addButton = document.createElement("button");
        addButton.textContent = "🛒 Add to Cart";
        addButton.disabled = Number(product.quantity || 0) < 1;
        addButton.addEventListener("click", function () {
            addToCart(product.id);
        });

        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.addEventListener("click", function () {
            updateProduct(product.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteProduct(product.id);
        });

        item.append(
            image,
            name,
            price,
            category,
            stock,
            quantityLabel,
            quantityInput,
            document.createElement("br"),
            addButton,
            updateButton,
            deleteButton
        );

        productsDiv.appendChild(item);
    });
}

// ADD TO CART
function addToCart(productId) {
    const product = allProducts.find(
        item => String(item.id) === String(productId)
    );

    if (!product) {
        alert("Product not found.");
        return;
    }

    const quantityInput =
        document.getElementById("buyQty-" + productId);

    const quantity = quantityInput
        ? Number(quantityInput.value)
        : 0;

    const stock = Number(product.quantity || 0);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > stock
    ) {
        alert("Please select a valid quantity within available stock.");
        return;
    }

    const existingItem = cart.find(
        item => String(item.id) === String(productId)
    );

    const currentQuantity = existingItem
        ? Number(existingItem.cartQuantity)
        : 0;

    if (currentQuantity + quantity > stock) {
        alert("You cannot add more than the available stock.");
        return;
    }

    if (existingItem) {
        existingItem.cartQuantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
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
        (total, item) => total + Number(item.cartQuantity || 0),
        0
    );

    const cartTotal = cart.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.cartQuantity || 0),
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
    if (
        price === null ||
        price.trim() === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0
    ) {
        alert("Please enter a valid price.");
        return;
    }

    const category = prompt("Enter new category:");
    if (category === null || !category.trim()) return;

    const quantity = prompt("Enter new stock quantity:");
    if (
        quantity === null ||
        quantity.trim() === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) < 0
    ) {
        alert("Please enter a valid stock quantity.");
        return;
    }

    const imageUrl = prompt("Enter new image URL:");
    if (imageUrl === null || !imageUrl.trim()) return;

    const product = {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        quantity: Number(quantity),
        imageUrl: imageUrl.trim()
    };

    try {
        const response = await fetch(API_URL + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        await handleResponse(response);

        alert("Product updated successfully!");
        await loadProducts();
    } catch (error) {
        console.error("Update product error:", error);
        alert("Failed to update product. Check the backend API.");
    }
}

// DELETE PRODUCT
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const response = await fetch(API_URL + "/" + id, {
            method: "DELETE"
        });

        await handleResponse(response);

        cart = cart.filter(
            item => String(item.id) !== String(id)
        );

        localStorage.setItem("cart", JSON.stringify(cart));

        alert("Product deleted successfully!");

        await loadProducts();
        updateCartSummary();
    } catch (error) {
        console.error("Delete product error:", error);
        alert("Failed to delete product. Check the backend API.");
    }
}

// INITIALIZE
document.addEventListener("DOMContentLoaded", function () {
    updateCartSummary();
    loadProducts();
});