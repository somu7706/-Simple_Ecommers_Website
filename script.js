// --- Data ---
const products = [
    { id: 1, name: "Air Max Street", price: 129.99, category: "shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.8, isNew: true },
    { id: 2, name: "Urban Hoodie", price: 79.99, category: "clothing", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.5, isNew: false },
    { id: 3, name: "Minimalist Watch", price: 199.99, category: "watches", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.9, isNew: true },
    { id: 4, name: "Classic Denim", price: 89.99, category: "clothing", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.3, isNew: false },
    { id: 5, name: "Sport Run 2.0", price: 149.99, category: "shoes", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.7, isNew: false },
    { id: 6, name: "Leather Backpack", price: 119.99, category: "accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.6, isNew: true },
    { id: 7, name: "Retro Sunglasses", price: 49.99, category: "accessories", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.2, isNew: false },
    { id: 8, name: "Graphic Tee", price: 34.99, category: "clothing", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=400&h=500", rating: 4.4, isNew: false }
];

// --- State ---
let cart = [];
let wishlist = [];
let currentCategory = 'all';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderProducts(products, 'featured-products'); // Render featured (just first 4)
    renderProducts(products, 'all-products'); // Render all in shop
    updateBadges();

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Filters
    const filterItems = document.querySelectorAll('.filter-list li');
    filterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            filterItems.forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            filterCategory(e.target.dataset.filter);
        });
    });

    // Search
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(term));
            renderProducts(filtered, 'all-products');
        });
    }

    // Sort
    const sortSelect = document.getElementById('sort-select');
    if(sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            let sorted = [...products];
            if (e.target.value === 'price-low') {
                sorted.sort((a, b) => a.price - b.price);
            } else if (e.target.value === 'price-high') {
                sorted.sort((a, b) => b.price - a.price);
            }
            if (currentCategory !== 'all') {
                sorted = sorted.filter(p => p.category === currentCategory);
            }
            renderProducts(sorted, 'all-products');
        });
    }
});

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// --- Navigation (SPA Logic) ---
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    document.getElementById(`page-${pageId}`).classList.add('active');

    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${pageId}`) {
            link.classList.add('active');
        }
    });

    // Close mobile menu if open
    document.getElementById('nav-links').classList.remove('active');
    document.querySelector('#mobile-toggle i').className = 'fas fa-bars';

    // Scroll to top
    window.scrollTo(0, 0);

    if(pageId === 'cart') {
        renderCart();
    }
}

// --- Rendering Products ---
function renderProducts(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Limit to 4 for featured
    const displayItems = containerId === 'featured-products' ? items.slice(0, 4) : items;

    if (displayItems.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No products found.</p>';
        return;
    }

    displayItems.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-container" onclick="viewProduct(${product.id})">
                ${product.isNew ? '<span class="product-badge">New</span>' : ''}
                <img src="${product.image}" alt="${product.name}">
                <div class="product-actions" onclick="event.stopPropagation()">
                    <button class="action-btn" onclick="toggleWishlist(${product.id})">
                        <i class="${isWishlisted ? 'fas' : 'far'} fa-heart" style="color: ${isWishlisted ? 'var(--accent-color)' : 'inherit'}"></i>
                    </button>
                    <button class="action-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info" onclick="viewProduct(${product.id})">
                <p class="product-category">${product.category}</p>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-rating">
                    ${getRatingHtml(product.rating)}
                    <span style="color:var(--text-muted);font-size:0.8rem;">(${Math.floor(Math.random() * 100) + 10})</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function getRatingHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            html += '<i class="fas fa-star"></i>';
        } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

// --- Product Logic ---
function filterCategory(category) {
    currentCategory = category;
    
    // Update sidebar UI if on shop page
    document.querySelectorAll('.filter-list li').forEach(li => {
        li.classList.remove('active');
        if(li.dataset.filter === category) li.classList.add('active');
    });

    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    renderProducts(filtered, 'all-products');
    
    // Navigate to shop page if not already there
    if (!document.getElementById('page-shop').classList.contains('active')) {
        navigateTo('shop');
    }
}

function viewProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const container = document.getElementById('product-details-content');
    container.innerHTML = `
        <div class="pd-images">
            <div class="pd-main-img">
                <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
            </div>
            <div class="pd-thumbnails">
                <div class="pd-thumb active"><img src="${product.image}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"></div>
                <div class="pd-thumb"><img src="${product.image}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;filter:grayscale(1)"></div>
            </div>
        </div>
        <div class="pd-info">
            <p class="product-category">${product.category}</p>
            <h1>${product.name}</h1>
            <div class="product-rating" style="margin-bottom:1rem;">
                ${getRatingHtml(product.rating)}
            </div>
            <div class="pd-price">$${product.price.toFixed(2)}</div>
            <p class="pd-desc">Premium quality materials crafted to perfection. This ${product.name.toLowerCase()} offers unmatched comfort and style for the modern individual.</p>
            
            <div class="selector-group">
                <h4>Select Size</h4>
                <div class="size-btns">
                    <button class="size-btn">S</button>
                    <button class="size-btn active">M</button>
                    <button class="size-btn">L</button>
                    <button class="size-btn">XL</button>
                </div>
            </div>
            
            <div class="pd-actions">
                <button class="btn btn-primary" style="flex:1;" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="btn btn-secondary" onclick="toggleWishlist(${product.id})">
                    <i class="${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        </div>
    `;
    navigateTo('product');
}

// --- Cart & Wishlist Logic ---
function addToCart(id) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, qty: 1 });
    }
    updateBadges();
    alert('Added to cart!'); // Could be replaced with a nice toast
}

function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(id);
    }
    updateBadges();
    // Re-render current views to update heart icons
    renderProducts(products, 'featured-products');
    filterCategory(currentCategory); // Re-renders shop based on current filter
}

function updateBadges() {
    document.getElementById('cart-badge').textContent = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('wishlist-badge').textContent = wishlist.length;
}

function renderCart() {
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        document.getElementById('cart-subtotal').textContent = '$0.00';
        document.getElementById('cart-total').textContent = '$0.00';
        return;
    }

    container.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
                <div class="cart-qty" style="margin-top:10px;">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(div);
    });

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${(subtotal + 10).toFixed(2)}`; // + $10 shipping
}

function updateQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            updateBadges();
            renderCart();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateBadges();
    renderCart();
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }
    alert('Thank you for your purchase! Your order has been placed successfully.');
    cart = [];
    updateBadges();
    renderCart();
    navigateTo('home');
}
