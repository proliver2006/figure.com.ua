// 1. ЕЛЕМЕНТИ
const homePage = document.getElementById('home-page');
const catalogPage = document.getElementById('catalog-page');
const homeLink = document.getElementById('home-link');
const catalogLink = document.getElementById('catalog-link');
const ctaButton = document.getElementById('go-to-catalog');

const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartButton = document.getElementById('cart-button');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');

let cart = [];

// 2. НАВІГАЦІЯ (Головна / Каталог)
function showHome(e) {
    if (e) e.preventDefault();

    homePage.style.display = 'block'; // Повертаємо головну
    catalogPage.style.display = 'none';
}

function showCatalog(e) {
    if (e) e.preventDefault();

    homePage.style.display = 'none';
    catalogPage.style.display = 'block';
    filterCategory('All'); // При відкритті показуємо всі товари
    renderProducts();
}
// Функція для програвання звуку переходу (тихо)
function playTransitionSound() {
    const audio = document.getElementById('transition-sound');
    if (audio) {
        audio.volume = 0.1;
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Браузер заблокував звук до першої взаємодії"));
    }
}

// Налаштування кнопки "Перейти до каталогу" (на Головній)
ctaButton.addEventListener('click', (e) => {
    playTransitionSound(); // Граємо звук тільки тут
    showCatalog(e);
});

// Налаштування посилань у меню (Головна, Каталог)
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const target = link.getAttribute('href');
        
        if (target === '#home') {
            playTransitionSound(); // Граємо звук при поверненні додому
            showHome(e);
        } else if (target === '#catalog') {
            playTransitionSound(); // Граємо звук при переході в каталог через меню
            showCatalog(e);
        }
    });
});

homeLink.onclick = showHome;
catalogLink.onclick = showCatalog;
if (ctaButton) ctaButton.onclick = showCatalog;

// 3. ЛОГІКА КАТАЛОГУ ТА ФІЛЬТРІВ
function filterCategory(categoryName) {
    // Стилі кнопок
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === categoryName || (categoryName === 'All' && btn.innerText === 'Всі')) {
            btn.classList.add('active');
        }
    });

    // Фільтрація масиву (products береться з data.js)
    const filtered = categoryName === 'All' 
        ? products 
        : products.filter(p => p.category === categoryName);

    renderProductsList(filtered);
}

function renderProductsList(productsArray) {
    const container = document.getElementById('product-container');
    if (!container) return;
    container.innerHTML = '';

    productsArray.forEach(product => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <p class="category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="price">${product.price} грн</p>
                <button class="buy-btn" onclick="addToCart(${product.id})">Купити</button>
            </div>
        `;
    });
}

// 4. ЛОГІКА КОШИКА
cartButton.onclick = () => {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
};

closeCart.onclick = cartOverlay.onclick = () => {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
};

// Функція додавання в кошик
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);

    // 1. Звук (вже маємо)
    const audio = document.getElementById('cart-sound');
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }

    // 2. АНІМАЦІЯ ПОЛЬОТУ
    // Знаходимо кнопку, на яку натиснули
    const btn = event.target;
    const card = btn.closest('.product-card'); // Знаходимо картку товару
    const img = card.querySelector('img'); // Беремо картинку з цієї картки
    const cartIcon = document.getElementById('cart-button'); // Твоя кнопка кошика

    if (img && cartIcon) {
        // Створюємо клон картинки
        const flyingImg = img.cloneNode();
        flyingImg.classList.add('flying-item');
        
        // Отримуємо координати початкової точки (картинки)
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        // Ставимо клон точно поверх оригіналу
        flyingImg.style.left = `${imgRect.left}px`;
        flyingImg.style.top = `${imgRect.top}px`;
        flyingImg.style.width = `${imgRect.width}px`;
        flyingImg.style.height = `${imgRect.height}px`;

        document.body.appendChild(flyingImg);

        // Запускаємо політ до кошика через мікро-затримку
        setTimeout(() => {
            flyingImg.style.left = `${cartRect.left + 15}px`;
            flyingImg.style.top = `${cartRect.top}px`;
            flyingImg.style.width = '20px';
            flyingImg.style.height = '20px';
            flyingImg.style.opacity = '0.5';
        }, 10);

        // Видаляємо клон після завершення анімації та "трясемо" кошик
        setTimeout(() => {
            flyingImg.remove();
            cartIcon.classList.add('cart-bounce');
            setTimeout(() => cartIcon.classList.remove('cart-bounce'), 400);
        }, 800);
    }

    updateCartUI();
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} грн</p>
                    <button class="remove-item" onclick="removeFromCart(${index})">Видалити</button>
                </div>
            </div>
        `;
    });

    cartTotalElement.innerText = total;
    cartCountElement.innerText = cart.length;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// Запуск при старті
document.addEventListener('DOMContentLoaded', () => {
    showHome(); // Починаємо з головної сторінки

    const modal = document.getElementById('payment-modal');
const closeBtn = document.querySelector('.close-modal');
const paymentForm = document.getElementById('payment-form');

// Функція відкриття (викликай її у кнопці "Перейти до оплати")

window.openPayment = function() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'block';
        // Рядок playTransitionSound()Зрозумів, видалено, щоб було тихо
    } else 
        console.error("Вікно payment-modal не знайдено в HTML!");
    }
// Закриття на "хрестик"
closeBtn.onclick = () => modal.style.display = 'none';

// Закриття при кліку поза вікном
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = 'none';
};

// Обробка форми
paymentForm.onsubmit = (e) => {
    e.preventDefault();
    alert('Оплата пройшла успішно! Дякуємо за покупку.');
    modal.style.display = 'none';
    cart = []; // Очищуємо кошик
    updateCartUI();
};
});