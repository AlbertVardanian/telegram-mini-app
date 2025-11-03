// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Получаем ID пользователя Telegram
const userTelegramId = tg.initDataUnsafe.user?.id || 'unknown_' + Date.now();

// ПАРОЛЬ ДЛЯ ДОСТУПА К АДМИНКЕ (ИЗМЕНИТЕ НА СВОЙ!)
const ADMIN_PASSWORD = "admin123";

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    showWelcomeScreen();
});

// ==================== ГЛАВНЫЙ ЭКРАН ====================

function showWelcomeScreen() {
    document.getElementById('app').innerHTML = `
        <div class="welcome-screen">
            <h1>🛍️ Анализ покупательских предпочтений</h1>
            <p>Исследуем популярные товары на маркетплейсах</p>
            
            <div class="welcome-buttons">
                <button class="btn-main" onclick="showUserSurvey()">
                    📝 Пройти опрос
                </button>
                <button class="btn-main admin-login-btn" onclick="showAdminLogin()">
                    🔐 Я админ
                </button>
            </div>
        </div>
    `;
}

// ==================== ЭКРАН ВВОДА ПАРОЛЯ ====================

function showAdminLogin() {
    document.getElementById('app').innerHTML = `
        <div class="password-screen">
            <h2>🔐 Вход в панель админа</h2>
            <p>Введите пароль для доступа к аналитике</p>
            
            <input type="password" id="adminPassword" placeholder="Введите пароль" class="password-input">
            <button id="submitPassword" class="submit-btn">Войти</button>
            
            <button onclick="showWelcomeScreen()" class="submit-btn" style="margin-top: 10px; background: #666;">
                ← Назад
            </button>
            
            <div id="passwordMessage"></div>
        </div>
    `;

    document.getElementById('submitPassword').addEventListener('click', checkAdminPassword);
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAdminPassword();
        }
    });
}

function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('passwordMessage');
    const password = passwordInput.value.trim();

    if (!password) {
        messageDiv.innerHTML = '<div class="error-message">Введите пароль</div>';
        return;
    }

    if (password === ADMIN_PASSWORD) {
        messageDiv.innerHTML = '<div class="success-message">✅ Доступ разрешен</div>';
        setTimeout(() => {
            showAdminMarketplaceSelect();
        }, 1000);
    } else {
        messageDiv.innerHTML = '<div class="error-message">❌ Неверный пароль</div>';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ==================== ПОЛЬЗОВАТЕЛЬСКИЙ ОПРОС ====================

function showUserSurvey() {
    document.getElementById('app').innerHTML = `
        <div id="userSurvey">
            <div id="step1" class="step active">
                <h2>🏪 Выберите маркетплейс</h2>
                <p>Где вы обычно ищете товары?</p>
                <div class="buttons-grid">
                    <button class="btn-marketplace" data-value="Wildberries">Wildberries</button>
                    <button class="btn-marketplace" data-value="OZON">OZON</button>
                    <button class="btn-marketplace" data-value="Яндекс.Маркет">Яндекс.Маркет</button>
                </div>
            </div>

            <div id="step2" class="step">
                <h2>📁 Найдите категорию</h2>
                <input type="text" id="categorySearch" placeholder="Начните вводить категорию..." class="search-input">
                <div id="categoryResults" class="results-container"></div>
            </div>

            <div id="step3" class="step">
                <h2>📦 Какой товар искали?</h2>
                <p>Пожалуйста, введите конкретное название товара</p>
                <input type="text" id="productInput" placeholder="Например: Беговые кроссовки Nike Air Max" class="product-input">
                <button id="submitProduct" class="submit-btn">Отправить</button>
            </div>

            <div id="step4" class="step">
                <h2>🎉 Спасибо за участие!</h2>
                <p>Ваш выбор сохранен анонимно и поможет нам в аналитике</p>
                <button onclick="showWelcomeScreen()" class="submit-btn">Вернуться</button>
            </div>
        </div>
    `;

    initUserSurvey();
}

// Состояние приложения для пользователя
let userData = {
    user_id: userTelegramId,
    anon_id: generateAnonId(),
    marketplace: '',
    category: '',
    product_query: ''
};

// Категории
const CATEGORIES = {
    "📱 ЭЛЕКТРОНИКА": [
        "Смартфоны и гаджеты",
        "Компьютеры и ноутбуки", 
        "Телевизоры и аудио",
        "Фото и видео техника",
        "Игровые приставки",
        "Умный дом",
        "Электротранспорт"
    ],
    
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "Крупная бытовая техника",
        "Малая кухонная техника", 
        "Климатическая техника",
        "Уборка и уход за одеждой",
        "Приготовление пищи",
        "Уход за внешностью"
    ],
    
    "👕 ОДЕЖДА И ОБУВЬ": [
        "Мужская одежда",
        "Женская одежда", 
        "Детская одежда",
        "Обувь",
        "Аксессуары",
        "Спортивная одежда",
        "Нижнее белье"
    ],
    
    "💄 КРАСОТА И ЗДОРОВЬЕ": [
        "Косметика",
        "Парфюмерия", 
        "Уход за кожей",
        "Уход за волосами",
        "Декоративная косметика",
        "Витамины и БАДы",
        "Медицинские изделия"
    ],
    
    "🎮 ИГРУШКИ И ХОББИ": [
        "Детские игрушки",
        "Настольные игры",
        "Конструкторы",
        "Творчество и рукоделие",
        "Коллекционирование",
        "Спортивные хобби",
        "Музыкальные инструменты"
    ],
    
    "🛋 ДОМ И САД": [
        "Мебель",
        "Текстиль для дома",
        "Декор и освещение",
        "Посуда и кухонные принадлежности",
        "Товары для сада",
        "Инструменты",
        "Хранение вещей"
    ],
    
    "👶 ДЕТСКИЕ ТОВАРЫ": [
        "Товары для малышей",
        "Детское питание",
        "Школьные принадлежности",
        "Детский транспорт",
        "Товары для кормления",
        "Гигиена и уход",
        "Безопасность"
    ],
    
    "🏃 СПОРТ И ОТДЫХ": [
        "Тренажеры и фитнес",
        "Спортивный инвентарь",
        "Туризм и кемпинг",
        "Велоспорт",
        "Зимние виды спорта",
        "Водные виды спорта",
        "Охота и рыбалка",
        "Спортивная обувь",
        "Спортивная одежда"
    ],
    
    "🚗 АВТОТОВАРЫ": [
        "Автозапчасти",
        "Шины и диски",
        "Автоэлектроника",
        "Уход за автомобилем",
        "Автоаксессуары",
        "Автомасла и химия",
        "Инструменты для авто"
    ],
    
    "📚 КНИГИ И КАНЦТОВАРЫ": [
        "Книги",
        "Канцелярские товары",
        "Офисные принадлежности",
        "Бумажная продукция",
        "Учебная литература",
        "Творческие наборы",
        "Электронные книги"
    ],
    
    "🐾 ЗООТОВАРЫ": [
        "Корм для животных",
        "Аксессуары для животных",
        "Игрушки для питомцев",
        "Ветеринарные товары",
        "Уход и гигиена",
        "Переноски и лежаки",
        "Одежда для животных"
    ],
    
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "Бакалея",
        "Молочные продукты",
        "Мясо и птица",
        "Рыба и морепродукты",
        "Овощи и фрукты",
        "Напитки",
        "Замороженные продукты"
    ]
};

// Запрещенные слова для категорий
const FORBIDDEN_WORDS = {
    "📱 ЭЛЕКТРОНИКА": [
        "книга", "ручка", "карандаш", "тетрадь", "еда", "продукты", "молоко", "хлеб",
        "abc", "test", "123", "qwerty", "asdf", "zxcv", "йцукен", "фыва",
        "123456", "000000", "111111", "aaa", "bbb", "ccc", "..." , "???", "!!!"
    ],
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "ручка", "карандаш", "тетрадь", "книга", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "👕 ОДЕЖДА И ОБУВЬ": [
        "холодильник", "телевизор", "ноутбук", "телефон", "компьютер", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "💄 КРАСОТА И ЗДОРОВЬЕ": [
        "машина", "шины", "компьютер", "телефон", "холодильник",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🎮 ИГРУШКИ И ХОББИ": [
        "продукты", "молоко", "хлеб", "еда", "телефон", "компьютер",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🛋 ДОМ И САД": [
        "телефон", "смартфон", "компьютер", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "👶 ДЕТСКИЕ ТОВАРЫ": [
        "телефон", "ноутбук", "компьютер", "машина", "шины",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🏃 СПОРТ И ОТДЫХ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🚗 АВТОТОВАРЫ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "📚 КНИГИ И КАНЦТОВАРЫ": [
        "телефон", "холодильник", "телевизор", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🐾 ЗООТОВАРЫ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "телефон", "книга", "ручка", "компьютер", "одежда",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ]
};

function generateAnonId() {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function initUserSurvey() {
    document.querySelectorAll('.btn-marketplace').forEach(btn => {
        btn.addEventListener('click', (e) => {
            userData.marketplace = e.target.dataset.value;
            showStep(2);
            initCategorySearch();
        });
    });

    document.getElementById('submitProduct').addEventListener('click', submitProduct);
}

function initCategorySearch() {
    const searchInput = document.getElementById('categorySearch');
    const resultsContainer = document.getElementById('categoryResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        displayCategories(searchCategories(query));
    });

    function searchCategories(query) {
        const results = {};
        
        for (const [section, categories] of Object.entries(CATEGORIES)) {
            const filtered = categories.filter(category => 
                category.toLowerCase().includes(query) || 
                section.toLowerCase().includes(query)
            );
            
            if (filtered.length > 0) {
                results[section] = filtered;
            }
        }
        
        return results;
    }

    function displayCategories(categoriesBySection) {
        let html = '';
        
        for (const [section, categories] of Object.entries(categoriesBySection)) {
            html += `<div class="category-section">${section}</div>`;
            
            categories.forEach(category => {
                html += `
                    <div class="category-item" data-category="${category}">
                        ${category}
                    </div>
                `;
            });
        }
        
        resultsContainer.innerHTML = html;

        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                userData.category = e.target.dataset.category;
                showStep(3);
            });
        });
    }

    displayCategories(CATEGORIES);
}

function validateProduct(product, category) {
    if (product.length < 3) {
        return "❌ Название товара должно содержать минимум 3 символа";
    }

    if (product.length > 100) {
        return "❌ Название товара слишком длинное";
    }

    const randomPatterns = [
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
        /(123|234|345|456|567|678|789|098|987|876|765|654|543|432|321)/,
        /(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i,
        /(йцу|цук|уке|кен|енг|нгш|гшщ|шщз|щзх|зхъ|фыв|ыва|вап|апр|про|рол|олд|лдж|джэ|жэё)/i
    ];
    
    if (randomPatterns.some(pattern => pattern.test(product))) {
        return "❌ Название товара содержит недопустимые последовательности";
    }

    const forbiddenWords = FORBIDDEN_WORDS[Object.keys(CATEGORIES).find(section => 
        CATEGORIES[section].includes(category)
    )] || [];

    if (forbiddenWords.some(word => product.toLowerCase().includes(word))) {
        return "❌ Этот товар не соответствует выбранной категории";
    }

    return null;
}

async function submitProduct() {
    const productInput = document.getElementById('productInput');
    const product = productInput.value.trim();

    if (!product) {
        alert('Пожалуйста, введите название товара');
        return;
    }

    const validationError = validateProduct(product, userData.category);
    if (validationError) {
        alert(validationError);
        return;
    }

    userData.product_query = product;

    try {
        const existingData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        
        const userChoices = existingData.filter(choice => choice.user_id === userTelegramId);
        if (userChoices.length >= 5) {
            alert('❌ Вы уже добавили максимальное количество товаров (5)');
            showStep(4);
            return;
        }

        const duplicate = userChoices.find(choice => 
            choice.product_query.toLowerCase() === product.toLowerCase()
        );
        
        if (duplicate) {
            alert('❌ Вы уже добавляли этот товар');
            return;
        }

        existingData.push({
            ...userData,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('user_choices', JSON.stringify(existingData));
        showStep(4);

    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при сохранении данных');
    }
}

// ==================== АДМИНСКАЯ ПАНЕЛЬ ====================

let selectedMarketplace = 'all';

function showAdminMarketplaceSelect() {
    document.getElementById('app').innerHTML = `
        <div class="admin-panel">
            <h2>📊 Выберите маркетплейс для аналитики</h2>
            <p>Для просмотра статистики выберите маркетплейс</p>
            
            <div class="buttons-grid">
                <button class="btn-admin" onclick="showAdminAnalytics('all')">
                    📈 Все маркетплейсы
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('Wildberries')">
                    🟣 Wildberries
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('OZON')">
                    🔵 OZON
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('Яндекс.Маркет')">
                    🟡 Яндекс.Маркет
                </button>
            </div>
            
            <button onclick="showWelcomeScreen()" class="submit-btn" style="margin-top: 20px;">
                ← Назад в меню
            </button>
        </div>
    `;
}

function showAdminAnalytics(marketplace) {
    selectedMarketplace = marketplace;
    
    document.getElementById('app').innerHTML = `
        <div class="admin-panel">
            <h2>📊 Аналитика ${marketplace === 'all' ? 'всех маркетплейсов' : marketplace}</h2>
            
            <div class="filter-buttons">
                <button class="btn-admin ${marketplace === 'all' ? 'active' : ''}" onclick="showAdminAnalytics('all')">Все</button>
                <button class="btn-admin ${marketplace === 'Wildberries' ? 'active' : ''}" onclick="showAdminAnalytics('Wildberries')">Wildberries</button>
                <button class="btn-admin ${marketplace === 'OZON' ? 'active' : ''}" onclick="showAdminAnalytics('OZON')">OZON</button>
                <button class="btn-admin ${marketplace === 'Яндекс.Маркет' ? 'active' : ''}" onclick="showAdminAnalytics('Яндекс.Маркет')">Яндекс.Маркет</button>
            </div>

            <div id="adminStats">
                <!-- Статистика загружается здесь -->
            </div>
            
            <button onclick="showAdminMarketplaceSelect()" class="submit-btn" style="margin-top: 20px;">
                ← Выбрать другой маркетплейс
            </button>
        </div>
    `;

    loadAdminStats();
}

function loadAdminStats() {
    try {
        const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        const filteredData = selectedMarketplace === 'all' 
            ? allData 
            : allData.filter(item => item.marketplace === selectedMarketplace);

        displayAdminStats(filteredData, allData);
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('adminStats').innerHTML = '<p class="error-message">Ошибка загрузки данных</p>';
    }
}

function displayAdminStats(data, allData) {
    const totalUsers = new Set(allData.map(item => item.user_id)).size;
    const filteredUsers = new Set(data.map(item => item.user_id)).size;

    const statsHTML = `
        <div class="total-stats">
            <h3>📈 Общая статистика</h3>
            <div class="stat-item">Всего выборов: <span class="count">${data.length}</span></div>
            <div class="stat-item">Уникальных пользователей: <span class="count">${filteredUsers}</span></div>
            <div class="stat-item">Среднее на пользователя: <span class="count">${filteredUsers > 0 ? (data.length / filteredUsers).toFixed(1) : 0}</span></div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>🏪 Распределение по маркетплейсам</h3>
                ${getMarketplaceStats(data)}
            </div>
            
            <div class="stat-card">
                <h3>📁 Топ категорий</h3>
                ${getCategoryStats(data, 5)}
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>📦 Популярные товары</h3>
                ${getProductStats(data, 8)}
            </div>
            
            <div class="stat-card">
                <h3>👥 Активность пользователей</h3>
                <div class="stat-item">Всего пользователей: <span class="count">${totalUsers}</span></div>
                <div class="stat-item">Активных в выборке: <span class="count">${filteredUsers}</span></div>
                <div class="stat-item">Выборов сегодня: <span class="count">${getTodayChoices(data)}</span></div>
            </div>
        </div>

        <div class="stat-card">
            <h3>🕒 Последние выборы</h3>
            ${getRecentChoices(data.slice(-5).reverse())}
        </div>
    `;

    document.getElementById('adminStats').innerHTML = statsHTML;
}

function getMarketplaceStats(data) {
    const stats = {};
    data.forEach(item => {
        stats[item.marketplace] = (stats[item.marketplace] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `
            <div class="stat-item">
                <span>${name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getCategoryStats(data, limit = 5) {
    const stats = {};
    data.forEach(item => {
        stats[item.category] = (stats[item.category] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => `
            <div class="stat-item">
                <span>${name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getProductStats(data, limit = 8) {
    const stats = {};
    data.forEach(item => {
        stats[item.product_query] = (stats[item.product_query] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => `
            <div class="stat-item">
                <span title="${name}">${name.length > 25 ? name.substring(0, 25) + '...' : name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getTodayChoices(data) {
    const today = new Date().toDateString();
    return data.filter(item => new Date(item.timestamp).toDateString() === today).length;
}

function getRecentChoices(recent) {
    return recent.map(item => `
        <div class="stat-item">
            <div>
                <strong>${item.marketplace}</strong> - ${item.category}<br>
                <small>${item.product_query}</small>
            </div>
            <small>${new Date(item.timestamp).toLocaleString('ru-RU')}</small>
        </div>
    `).join('');
}
