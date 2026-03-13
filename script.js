// 🔧 UPDATE THIS to your deployed backend URL after deploying the backend on Vercel/Render
// Example: const API_BASE = 'https://eatsbite-backend.vercel.app/api';
const API_BASE = 'http://localhost:3000/api'; // ← local development URL

// State Management
let cart = [];
let menuData = [];
let currentUser = JSON.parse(localStorage.getItem('eatsbite_user')) || null;

// DOM Elements (some only exist on index.html — guard all accesses)
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const cartCountElements = document.querySelectorAll('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');

const authBtn = document.getElementById('authBtn');
const authModal = document.getElementById('authModal');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authSwitchText = document.getElementById('authSwitchText');

const userProfile = document.getElementById('userProfile');
const userNameDisplay = document.getElementById('userNameDisplay');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

const myOrdersLink = document.getElementById('myOrdersLink');
const ordersList = document.getElementById('ordersList');

const userMenuBtn = document.getElementById('userMenuBtn');
const userDropdown = document.getElementById('userDropdown');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');

// Profile Form Elements
const profileForm = document.getElementById('profileForm');
const editFullname = document.getElementById('editFullname');
const editEmail = document.getElementById('editEmail');
const editMobile = document.getElementById('editMobile');
const editAddress = document.getElementById('editAddress');

let isLoginMode = true;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    
    // Check if on a page with menu before fetching
    if (document.getElementById('menuContainer')) {
        await fetchMenu();
    }
    
    updateCartUI();

    if (currentUser) {
        if (typeof fetchOrders === 'function') fetchOrders();
    }

    // Dynamic Navigation Active State
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href) {
            if (currentPath === 'orders.html' && href.includes('orders.html')) {
                link.classList.add('active');
            } else if ((currentPath === 'index.html' || currentPath === '') && href.includes('#hero')) {
                link.classList.add('active');
            }
        }
    });
});

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Fetch Menu Display
async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE}/menu`);
        menuData = await response.json();
        renderMenu();
        renderFoodBackground(); // 🍔 animate food images in hero bg
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        document.getElementById('menuContainer').innerHTML = '<p style="color:red; text-align:center;">Failed to load premium menu. Please check your connection.</p>';
    }
}

function renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return; // Prevent error if not on index page
    container.innerHTML = '';
    
    menuData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-img">
            <div class="menu-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-footer">
                    <span class="price">₹${item.price}</span>
                    <button class="add-btn" onclick="addToCart('${item.id}')">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ============================================================
//  Animated Food Background — fills hero with floating orbs
// ============================================================
function renderFoodBackground() {
    const canvas = document.getElementById('foodBgCanvas');
    if (!canvas || !menuData.length) return;
    canvas.innerHTML = '';

    const rand = (min, max) => Math.random() * (max - min) + min;
    const randInt = (min, max) => Math.floor(rand(min, max));
    const randPx = (min, max) => `${rand(min, max).toFixed(1)}px`;
    const sign = () => (Math.random() > 0.5 ? 1 : -1);

    // Use each image up to 2× to fill the background richly
    const images = [...menuData, ...menuData].map(i => i.image);

    images.forEach((src, idx) => {
        const size = randInt(90, 200);           // orb diameter px
        const left = rand(0, 96);                // % across viewport
        const top  = rand(0, 92);                // % down viewport

        const dur      = rand(14, 26).toFixed(1) + 's';
        const fadeDur  = rand(8, 18).toFixed(1) + 's';
        const spinDur  = rand(20, 50).toFixed(1) + 's';
        const delay    = rand(0, 14).toFixed(1) + 's';
        const maxOpacity = rand(0.30, 0.60).toFixed(2);
        const scaleStart = rand(0.75, 1.0).toFixed(2);

        // Unique drift vectors for each waypoint
        const dx1 = randPx(-60 * sign(), 60);
        const dy1 = randPx(-50 * sign(), 50);
        const dx2 = randPx(-80 * sign(), 80);
        const dy2 = randPx(-60 * sign(), 60);
        const dx3 = randPx(-40 * sign(), 40);
        const dy3 = randPx(-80 * sign(), 80);
        const dx4 = randPx(-70 * sign(), 70);
        const dy4 = randPx(-40 * sign(), 40);

        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.className = 'food-orb';
        img.width  = size;
        img.height = size;

        img.style.cssText = `
            left: ${left}%;
            top: ${top}%;
            width: ${size}px;
            height: ${size}px;
            --dur: ${dur};
            --fade-dur: ${fadeDur};
            --spin-dur: ${spinDur};
            --delay: ${delay};
            --max-opacity: ${maxOpacity};
            --scale-start: ${scaleStart};
            --dx1: ${dx1}; --dy1: ${dy1};
            --dx2: ${dx2}; --dy2: ${dy2};
            --dx3: ${dx3}; --dy3: ${dy3};
            --dx4: ${dx4}; --dy4: ${dy4};
        `;

        canvas.appendChild(img);
    });
}



// Cart Functionality
window.addToCart = function(itemId) {
    if (!currentUser) {
        showToast('Please login or sign up to add items to your cart.');
        isLoginMode = true; // ensure it opens on login
        handleAuthModeToggle(); // reset if needed
        isLoginMode = true;
        authTitle.textContent = 'Login to EatsBite';
        document.getElementById('submitAuthBtn').textContent = 'Login';
        document.getElementById('authSwitchPrompt').textContent = "Don't have an account?";
        document.getElementById('toggleAuthMode').textContent = "Sign Up";
        document.querySelectorAll('.signup-only').forEach(el => {
            el.style.display = 'none';
            const input = el.querySelector('input');
            if(input) input.required = false;
        });
        authModal.classList.add('active');
        return;
    }

    const item = menuData.find(m => m.id === itemId);
    if (!item) return;

    const existing = cart.find(c => c.id === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartUI();
    showToast(`${item.name} added to cart`);
    
    // Animate cart icon (only on index page)
    if (cartBtn) {
        cartBtn.style.transform = 'scale(1.2)';
        setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
    }
};

window.updateQty = function(itemId, amount) {
    const itemInfo = cart.find(c => c.id === itemId);
    if (itemInfo) {
        itemInfo.quantity += amount;
        if (itemInfo.quantity <= 0) {
            cart = cart.filter(c => c.id !== itemId);
        }
    }
    updateCartUI();
};

function updateCartUI() {
    // These elements only exist on index.html — skip gracefully on orders page
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg" style="text-align:center;color:#a3a3a3;margin-top:20px;">Your cart is feeling incredibly empty.</p>';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        if (checkoutBtn) checkoutBtn.disabled = false;
        cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <span class="cart-price">₹${(item.price * item.quantity)}</span>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }
    
    if (cartTotalPrice) cartTotalPrice.textContent = `₹${total}`;
    cartCountElements.forEach(el => el.textContent = count);
}

// Modal Listeners
if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
}
if (closeCartBtn && cartModal) {
    closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
}

if (authBtn && authModal) {
    authBtn.addEventListener('click', () => authModal.classList.add('active'));
}
if (closeAuthBtn && authModal) {
    closeAuthBtn.addEventListener('click', () => authModal.classList.remove('active'));
}

// Close cart modal when clicking outside
if (cartModal) {
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) cartModal.classList.remove('active');
    });
}

// Auth Functionality
let mapInitialized = false;
let map;
let marker;
let selectedLocation = { lat: null, lng: null };

function initMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', function(e) {
        if(marker) map.removeLayer(marker);
        marker = L.marker(e.latlng).addTo(map);
        selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
    });

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 13);
        });
    }
    mapInitialized = true;
}

function handleAuthModeToggle(e) {
    if (e) e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Login to EatsBite' : 'Join EatsBite Premium';
    document.getElementById('submitAuthBtn').textContent = isLoginMode ? 'Login' : 'Sign Up';
    
    document.getElementById('authSwitchPrompt').textContent = isLoginMode ? "Don't have an account?" : "Already have an account?";
    document.getElementById('toggleAuthMode').textContent = isLoginMode ? "Sign Up" : "Login";

    const signupOnlyElements = document.querySelectorAll('.signup-only');
    signupOnlyElements.forEach(el => {
        el.style.display = isLoginMode ? 'none' : 'block';
        const input = el.querySelector('input');
        if(input) input.required = !isLoginMode;
    });

    if (!isLoginMode && !mapInitialized) {
        setTimeout(initMap, 200);
    } else if (!isLoginMode && mapInitialized && map) {
        setTimeout(() => map.invalidateSize(), 200);
    }
}

document.getElementById('toggleAuthMode').addEventListener('click', handleAuthModeToggle);

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    let bodyData = { username: user, password: pass };

    if (!isLoginMode) {
        bodyData.fullname = document.getElementById('fullname').value;
        bodyData.email = document.getElementById('email').value;
        bodyData.mobile = document.getElementById('mobile').value;
        bodyData.address = document.getElementById('address').value;
        bodyData.location = selectedLocation;
        
        if (!selectedLocation.lat) {
            showToast('Please pin your location on the map');
            return;
        }
    }
    
    const endpoint = isLoginMode ? '/login' : '/register';
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (isLoginMode) {
                currentUser = data;
                localStorage.setItem('eatsbite_user', JSON.stringify(currentUser));
                showToast(`Welcome to EatsBite, ${currentUser.username}!`);
                authModal.classList.remove('active');
                updateAuthUI();
                fetchOrders();
            } else {
                showToast('Registration successful! Please login.');
                handleAuthModeToggle(); // switch to login modal immediately
                document.getElementById('password').value = ''; // clear password field
            }
        } else {
            showToast(data.error || 'Authentication failed');
        }
    } catch (error) {
        showToast('Network error during authentication.');
    }
});

function updateAuthUI() {
    if (currentUser) {
        if(authBtn) authBtn.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';
        const firstName = currentUser.fullname ? currentUser.fullname.split(' ')[0] : currentUser.username;
        if(userNameDisplay) userNameDisplay.textContent = firstName;
        if(myOrdersLink) myOrdersLink.style.display = 'block';
        if(cartBtn) cartBtn.style.display = 'block';
        
        // Populate profile form
        if (editFullname) editFullname.value = currentUser.fullname || '';
        if (editEmail) editEmail.value = currentUser.email || '';
        if (editMobile) editMobile.value = currentUser.mobile || '';
        if (editAddress) editAddress.value = currentUser.address || '';
    } else {
        if(authBtn) authBtn.style.display = 'block';
        if(userProfile) userProfile.style.display = 'none';
        if(myOrdersLink) myOrdersLink.style.display = 'none';
        if(cartBtn) cartBtn.style.display = 'none';
        cart = [];
        updateCartUI();
    }
}

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('eatsbite_user');
    updateAuthUI();
    showToast('Successfully logged out.');
});

// Checkout Flow
if (checkoutBtn) checkoutBtn.addEventListener('click', async () => {
    if (!currentUser) {
        authModal.classList.add('active');
        showToast('Please login to checkout.');
        return;
    }

    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsJson = JSON.stringify(cart);

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing...';

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                items: itemsJson,
                total: total
            })
        });

        if (response.ok) {
            cart = [];
            updateCartUI();
            cartModal.classList.remove('active');
            showToast('Order placed successfully! Forwarding to orders...');
            if (typeof fetchOrders === 'function') fetchOrders();
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1000);
        } else {
            showToast('Checkout failed.');
        }
    } catch (error) {
        showToast('Network error during checkout.');
    } finally {
        if (checkoutBtn) checkoutBtn.textContent = 'Proceed to Checkout';
        if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    }
});

// Fetch Orders Profile
async function fetchOrders() {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_BASE}/orders/${currentUser.id}`);
        const orders = await response.json();
        
        if (orders.length > 0) {
            ordersList.innerHTML = '';
            
            orders.forEach(order => {
                const itemsParsed = JSON.parse(order.items);
                const itemsString = itemsParsed.map(i => `${i.quantity}x ${i.name}`).join(', ');
                
                const card = document.createElement('div');
                card.className = 'order-card';
                card.dataset.orderId = order.id;
                card.innerHTML = `
                    <div class="order-header">
                        <span class="order-id"><i class="fa-solid fa-receipt"></i> Order #EB${order.id.slice(-6).toUpperCase()}</span>
                        <span class="order-status">${order.status}</span>
                    </div>
                    <div class="order-item-list">
                        <span class="order-items"><i class="fa-solid fa-box"></i> ${itemsString}</span>
                    </div>
                    <div class="order-footer-row">
                        <div class="order-total">Total: ₹${order.total}</div>
                        <button class="order-delete-btn" onclick="deleteOrder('${order.id}', this)">
                            <i class="fa-solid fa-trash-can"></i> Delete Order
                        </button>
                    </div>
                `;
                ordersList.appendChild(card);
            });
        } else {
            ordersList.innerHTML = '<p class="no-orders-msg"><i class="fa-solid fa-bowl-food"></i><br>No orders yet. Time to explore the menu!</p>';
        }
    } catch (error) {
        console.error('Failed to load orders', error);
    }
}

// Delete a single order
window.deleteOrder = async function(orderId, btn) {
    if (!confirm('Remove this order from your history?')) return;

    const card = btn.closest('.order-card');

    // Animate out
    card.style.transition = 'transform 0.35s ease, opacity 0.35s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease';
    card.style.overflow = 'hidden';
    card.style.transform = 'translateX(60px)';
    card.style.opacity = '0';

    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`, { method: 'DELETE' });
        if (response.ok) {
            setTimeout(() => {
                card.style.maxHeight = '0';
                card.style.marginBottom = '0';
                card.style.paddingTop = '0';
                card.style.paddingBottom = '0';
                setTimeout(() => {
                    card.remove();
                    // If no cards left, show empty state
                    const remaining = ordersList ? ordersList.querySelectorAll('.order-card') : [];
                    if (remaining.length === 0 && ordersList) {
                        ordersList.innerHTML = '<p class="no-orders-msg"><i class="fa-solid fa-bowl-food"></i><br>No orders yet. Time to explore the menu!</p>';
                    }
                }, 420);
            }, 300);
            showToast('Order removed from history.');
        } else {
            // Restore card if delete failed
            card.style.transform = '';
            card.style.opacity = '';
            showToast('Failed to delete order. Please try again.');
        }
    } catch (err) {
        card.style.transform = '';
        card.style.opacity = '';
        showToast('Network error. Could not delete order.');
    }
};

// Document level event listeners including profile and deletion
document.addEventListener('click', async (e) => {
    // Dropdown toggle
    const menuBtn = e.target.closest('#userMenuBtn');
    if (menuBtn) {
        e.stopPropagation();
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    } else {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.style.display = 'none';
    }

    // Modal Triggers
    if (e.target.closest('#profileBtn')) {
        const modal = document.getElementById('editProfileModal');
        if (modal) modal.classList.add('active');
    }

    if (e.target.closest('#closeProfileBtn')) {
        const modal = document.getElementById('editProfileModal');
        if (modal) modal.classList.remove('active');
    }

    if (e.target.closest('#deleteAccountBtn')) {
        if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`${API_BASE}/users/${currentUser.id}`, { method: 'DELETE' });
                if (response.ok) {
                    currentUser = null;
                    localStorage.removeItem('eatsbite_user');
                    updateAuthUI();
                    showToast('Account successfully deleted.');
                    if (window.location.pathname.includes('orders.html')) {
                        window.location.href = 'index.html';
                    }
                } else {
                    showToast('Failed to delete account.');
                }
            } catch(error) {
                showToast('Network error during deletion.');
            }
        }
    }

    if (e.target.closest('#logoutBtn')) {
        currentUser = null;
        localStorage.removeItem('eatsbite_user');
        updateAuthUI();
        showToast('Successfully logged out.');
        if (window.location.pathname.includes('orders.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Profile Update Flow
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const btn = profileForm.querySelector('button');
    btn.textContent = 'Saving...';
    btn.disabled = true;

    const updatedData = {
        fullname: editFullname.value,
        email: editEmail.value,
        mobile: editMobile.value,
        address: editAddress.value
    };

    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        
        if (response.ok) {
            currentUser = { ...currentUser, ...updatedData };
            localStorage.setItem('eatsbite_user', JSON.stringify(currentUser));
            showToast('Profile updated successfully!');
            updateAuthUI();
            if (editProfileModal) editProfileModal.classList.remove('active');
        } else {
            showToast(data.error || 'Failed to update profile');
        }
    } catch (error) {
        showToast('Network error during profile update.');
    } finally {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
    }
});
