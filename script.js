const products = document.querySelectorAll(".product");
const filters = document.querySelectorAll(".filter");

const cart = JSON.parse(localStorage.getItem("winora-cart") || "[]");
const favorites = JSON.parse(localStorage.getItem("winora-favorites") || "[]");

const cartBox = document.querySelector("#cart");
const cartOverlay = document.querySelector("#cart-overlay");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const favoritesCount = document.querySelector("#favorites-count");

const cartTemplate = document.querySelector("#cart-template");
const emptyCart = document.querySelector(".empty-cart");

const cartBtn = document.querySelector("#cart-btn");
const closeCart = document.querySelector("#close-cart");
const favoritesBtn = document.querySelector("#favorites-btn");
const checkout = document.querySelector("#checkout");

const loader = document.querySelector("#loader");
const menuBtn = document.querySelector("#menu-btn");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector("#contact-form");

let favoritesMode = false;
let currentFilter = "all";

function saveData() {
    localStorage.setItem("winora-cart", JSON.stringify(cart));
    localStorage.setItem("winora-favorites", JSON.stringify(favorites));
}

function updateFavorites() {
    favoritesCount.textContent = favorites.length;

    products.forEach(product => {
        const id = product.dataset.id;
        const button = product.querySelector(".like-btn");
        const icon = button.querySelector("i");

        if (favorites.includes(id)) {
            button.classList.add("liked");
            icon.className = "fa-solid fa-heart";
        } else {
            button.classList.remove("liked");
            icon.className = "fa-regular fa-heart";
        }
    });

    saveData();
}

function updateCart() {
    let total = 0;
    let count = 0;

    cartItems.querySelectorAll(".cart-item").forEach(item => {
        item.remove();
    });

    emptyCart.hidden = cart.length !== 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const clone = cartTemplate.content.cloneNode(true);
        const itemElement = clone.querySelector(".cart-item");

        itemElement.dataset.id = item.id;

        clone.querySelector(".cart-item-name").textContent = item.name;
        clone.querySelector(".cart-item-price").textContent = `$${item.price}`;
        clone.querySelector(".cart-quantity").textContent = item.quantity;

        cartItems.append(clone);
    });

    cartCount.textContent = count;
    cartTotal.textContent = total.toLocaleString("en-US");

    saveData();
}

function showProducts() {
    products.forEach(product => {
        const categoryMatch =
            currentFilter === "all" ||
            product.dataset.category === currentFilter;

        const favoriteMatch =
            !favoritesMode ||
            favorites.includes(product.dataset.id);

        product.hidden = !(categoryMatch && favoriteMatch);
    });
}

function openCart() {
    cartBox.classList.add("show");
    cartOverlay.classList.add("show");
    document.body.classList.add("no-scroll");
}

function closeCartPanel() {
    cartBox.classList.remove("show");
    cartOverlay.classList.remove("show");
    document.body.classList.remove("no-scroll");
}

products.forEach(product => {
    product.addEventListener("click", event => {
        const likeButton = event.target.closest(".like-btn");
        const addButton = event.target.closest(".add-btn");

        const id = product.dataset.id;

        if (likeButton) {
            const index = favorites.indexOf(id);

            if (index !== -1) {
                favorites.splice(index, 1);
            } else {
                favorites.push(id);
            }

            updateFavorites();

            if (favoritesMode) {
                showProducts();
            }
        }

        if (addButton) {
            const name = product.querySelector("h3").textContent.trim();

            const price = Number(
                product.querySelector(".product-bottom strong")
                    .textContent.replace(/[^0-9.]/g, "")
            );

            if (!Number.isFinite(price)) return;

            const existing = cart.find(item => item.id === id);

            if (existing) {
                existing.quantity++;
            } else {
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            updateCart();

            addButton.innerHTML = 'Added <i class="fa-solid fa-check"></i>';

            setTimeout(() => {
                addButton.innerHTML = 'Add to cart <i class="fa-solid fa-arrow-right"></i>';
            }, 1000);
        }
    });
});

filters.forEach(button => {
    button.addEventListener("click", () => {
        filters.forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;
        favoritesMode = false;
        favoritesBtn.classList.remove("active");

        showProducts();
    });
});

favoritesBtn.addEventListener("click", () => {
    favoritesMode = !favoritesMode;
    favoritesBtn.classList.toggle("active", favoritesMode);

    filters.forEach(filter => {
        filter.classList.remove("active");
    });

    document.querySelector('[data-filter="all"]').classList.add("active");
    currentFilter = "all";

    showProducts();

    document.querySelector("#products").scrollIntoView({
        behavior: "smooth"
    });
});

cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

cartItems.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    const itemElement = button.closest(".cart-item");
    const id = itemElement.dataset.id;

    const item = cart.find(product => product.id === id);

    if (!item) return;

    if (button.dataset.action === "plus") {
        item.quantity++;
    }

    if (button.dataset.action === "minus") {
        item.quantity--;

        if (item.quantity <= 0) {
            const index = cart.indexOf(item);
            cart.splice(index, 1);
        }
    }

    if (button.classList.contains("remove-item")) {
        const index = cart.indexOf(item);
        cart.splice(index, 1);
    }

    updateCart();
});

checkout.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    alert("Thank you! Online checkout is not connected yet.");
});

menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");

    const icon = menuBtn.querySelector("i");

    if (navLinks.classList.contains("open")) {
        icon.className = "fa-solid fa-xmark";
    } else {
        icon.className = "fa-solid fa-bars";
    }
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuBtn.querySelector("i").className = "fa-solid fa-bars";
    });
});

setTimeout(() => {
    loader.classList.add("hide");

    setTimeout(() => {
        loader.style.display = "none";
    }, 700);
}, 1500);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    document.querySelectorAll(".reveal").forEach(element => {
        observer.observe(element);
    });
} else {
    document.querySelectorAll(".reveal").forEach(element => {
        element.classList.add("visible");
    });
}

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    alert("This is a demo form. Connect a backend to receive real requests.");

    contactForm.reset();
});

updateCart();
updateFavorites();
showProducts();